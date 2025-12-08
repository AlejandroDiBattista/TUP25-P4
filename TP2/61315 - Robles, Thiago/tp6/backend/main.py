from fastapi import FastAPI, Query, Path, Body, HTTPException, status, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from sqlmodel import SQLModel, Session, create_engine, select
from sqlalchemy import or_
from pydantic import BaseModel, Field as PydanticField
from pydantic import field_validator, AliasChoices

from typing import Optional

import json
from pathlib import Path as PathlibPath
from passlib.context import CryptContext
from passlib.exc import UnknownHashError


from models.usuario import Usuario
from models.producto import Producto
from models.compra import Compras, CompraItem
from models.carrito import Carrito, CarritoItem

from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone


BASE_DIR = PathlibPath(__file__).resolve().parent
DB_PATH = BASE_DIR / "parcialdatabase.db"
SEED_PATH = BASE_DIR / "productos.json"

engine = create_engine(f"sqlite:///{DB_PATH}", echo=True)

app = FastAPI(title="API Productos")


def crear_db():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        productos = session.exec(select(Producto)).all()
        if not productos:
            with open(SEED_PATH, "r", encoding="utf-8") as archivo:
                datos_productos = json.load(archivo)
                for item in datos_productos:
                    producto = Producto(**item)
                    session.add(producto)
                session.commit()


@app.on_event("startup")
def on_startup():
    crear_db()


# Montar directorio de imágenes como archivos estáticos
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Cargar productos desde el archivo JSON
def cargar_productos():
    ruta_productos = PathlibPath(__file__).parent / "productos.json"
    with open(ruta_productos, "r", encoding="utf-8") as archivo:
        return json.load(archivo)


@app.get("/")
def root():
    return {"mensaje": "API de Productos - use /productos para obtener el listado"}


# Endpoints de Auth


# Hash de contraseña
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_contraseña(contraseña: str) -> str:
    return pwd_context.hash(contraseña)


def verificar_contraseña(contraseña: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(contraseña, hashed)
    except UnknownHashError:
        return False


# Generar Token
SECRET_KEY = "el_mejor_eccomerce"  # TODO: mover a variable de entorno
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def crear_token(datos: dict, expires_delta: int | None = None):
    copiar_datos = datos.copy()
    exp_minutes = (
        expires_delta if expires_delta is not None else ACCESS_TOKEN_EXPIRE_MINUTES
    )
    expire = datetime.now(timezone.utc) + timedelta(minutes=exp_minutes)
    copiar_datos.update({"exp": expire})
    token = jwt.encode(copiar_datos, SECRET_KEY, algorithm=ALGORITHM)
    return token


class UsuarioRegistroIn(BaseModel):
    nombre: str
    email: str
    # Acepta tanto "password" como "contraseña" desde el cuerpo JSON
    contraseña: str = PydanticField(
        ..., validation_alias=AliasChoices("password", "contraseña")
    )


@app.post("/registrar", status_code=201)
def registrar_usuario(usuario: UsuarioRegistroIn):

    with Session(engine) as session:
        nuevo_usuario = Usuario(
            nombre=usuario.nombre,
            email=usuario.email,
            contraseña=usuario.contraseña,
        )

        # Validar si el usuario ya existe
        usuario_existe = session.exec(
            select(Usuario).where(Usuario.email == usuario.email)
        ).first()

        if usuario_existe:
            raise HTTPException(status_code=400, detail="El usuario ya existe")

        # Hashear contraseña con manejo de errores por longitud
        try:
            nuevo_usuario.contraseña = hash_contraseña(usuario.contraseña)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        session.add(nuevo_usuario)
        session.commit()
        session.refresh(nuevo_usuario)
        return nuevo_usuario


class UsuarioLoginIn(BaseModel):
    email: Optional[str] = None
    nombre: Optional[str] = None
    # Acepta "password" o "contraseña" como clave del JSON
    contraseña: str = PydanticField(
        ..., validation_alias=AliasChoices("password", "contraseña")
    )


@app.post("/iniciar-sesion")
def iniciar_sesion(usuario: UsuarioLoginIn):

    with Session(engine) as session:
        if not usuario.email and not usuario.nombre:
            raise HTTPException(status_code=400, detail="Debe enviar email o nombre")

        condiciones = []
        if usuario.email:
            condiciones.append(Usuario.email == usuario.email)
        if usuario.nombre:
            condiciones.append(Usuario.nombre == usuario.nombre)

        usuario_db = session.exec(select(Usuario).where(or_(*condiciones))).first()

        if not usuario_db or not verificar_contraseña(
            usuario.contraseña, usuario_db.contraseña
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas",
            )
    token = crear_token({"usuario_id": usuario_db.id, "email": usuario_db.email})
    return {"access_token": token, "token_type": "bearer", "usuario_id": usuario_db.id}


def get_current_user_id(authorization: str | None = Header(None)) -> int:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Falta token de autorización")
    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id: int | None = payload.get("usuario_id")
        if not usuario_id:
            raise HTTPException(status_code=401, detail="Token inválido")
        return int(usuario_id)
    except JWTError as e:
        detalle = (
            "Token expirado" if "Signature has expired" in str(e) else "Token inválido"
        )
        raise HTTPException(status_code=401, detail=detalle)


@app.post("/cerrar-sesion")
def cerrar_sesion(current_user_id: int = Depends(get_current_user_id)):
    return {"mensaje": "Sesión cerrada", "usuario_id": current_user_id}


# Endpoints de Productos


@app.get("/productos", response_model=list[Producto])
@app.get("/productos/", response_model=list[Producto])
def obtener_productos(
    categoria: Optional[str] = Query(None, description="Filtrar por categoria"),
    buscar: Optional[str] = Query(None, description="Buscar por nombre"),
):
    with Session(engine) as session:
        query = select(Producto)
        # Filtro por categoría: coincidencia parcial y case-insensitive
        if categoria:
            cat = categoria.strip()
            if cat:
                # Normalizar casos comunes (electro -> electr) para cubrir tildes/variantes
                cat_norm = cat.lower()
                if "electro" in cat_norm:
                    cat_like = "electr"
                else:
                    cat_like = cat
                query = query.where(Producto.categoria.ilike(f"%{cat_like}%"))

        # Búsqueda por texto: en título y descripción, parcial y case-insensitive
        if buscar:
            q = buscar.strip()
            if q:
                query = query.where(
                    or_(
                        Producto.titulo.ilike(f"%{q}%"),
                        Producto.descripcion.ilike(f"%{q}%"),
                    )
                )
        productos = session.exec(query).all()
        return productos


@app.get("/productos/{id}")
def obtener_producto(id: int):
    with Session(engine) as session:
        producto = session.get(Producto, id)
        if producto:
            return producto
        raise HTTPException(status_code=404, detail="Producto no encontrado")


# Endpoints de Carrito


# 🧩 Helper: obtener o crear carrito activo
def obtener_o_crear_carrito_activo(session: Session, usuario_id: int) -> Carrito:
    carrito = session.exec(
        select(Carrito).where(
            Carrito.usuario_id == usuario_id, Carrito.estado == "activo"
        )
    ).first()

    if not carrito:
        carrito = Carrito(usuario_id=usuario_id, estado="activo")
        session.add(carrito)
        session.commit()
        session.refresh(carrito)

    return carrito


# ------------------------------
# POST /carrito → agregar producto
# ------------------------------
class AgregarCarritoIn(BaseModel):
    producto_id: int
    cantidad: int = 1


@app.post("/carrito")
def agregar_producto(
    body: AgregarCarritoIn = Body(...),
    current_user_id: int = Depends(get_current_user_id),
):
    with Session(engine) as session:
        producto = session.get(Producto, body.producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        if producto.existencia < body.cantidad:
            raise HTTPException(status_code=400, detail="Stock insuficiente")

        carrito = obtener_o_crear_carrito_activo(session, current_user_id)

        item = session.exec(
            select(CarritoItem).where(
                CarritoItem.carrito_id == carrito.id,
                CarritoItem.producto_id == body.producto_id,
            )
        ).first()

        if item:
            nueva_cantidad = item.cantidad + body.cantidad
            if nueva_cantidad > producto.existencia:
                raise HTTPException(status_code=400, detail="No hay stock suficiente")
            item.cantidad = nueva_cantidad
        else:
            item = CarritoItem(
                carrito_id=carrito.id,
                producto_id=producto.id,
                cantidad=body.cantidad,
            )
            session.add(item)

        session.commit()
        return {"message": "Producto agregado al carrito correctamente"}


# ------------------------------
# DELETE /carrito/{producto_id} → quitar producto
# ------------------------------
@app.delete("/carrito/{producto_id}")
def quitar_producto(
    producto_id: int,
    current_user_id: int = Depends(get_current_user_id),
):
    with Session(engine) as session:
        carrito = session.exec(
            select(Carrito).where(
                Carrito.usuario_id == current_user_id, Carrito.estado == "activo"
            )
        ).first()

        if not carrito:
            raise HTTPException(status_code=404, detail="No hay carrito activo")

        item = session.exec(
            select(CarritoItem).where(
                CarritoItem.carrito_id == carrito.id,
                CarritoItem.producto_id == producto_id,
            )
        ).first()

        if not item:
            raise HTTPException(
                status_code=404, detail="El producto no está en el carrito"
            )

        session.delete(item)
        session.commit()
        return {"message": "Producto eliminado del carrito"}


# ------------------------------
# GET /carrito → ver contenido
# ------------------------------
@app.get("/carrito")
def ver_carrito(current_user_id: int = Depends(get_current_user_id)):
    with Session(engine) as session:
        carrito = session.exec(
            select(Carrito).where(
                Carrito.usuario_id == current_user_id, Carrito.estado == "activo"
            )
        ).first()

        if not carrito:
            return {"carrito": None, "items": []}

        resultados = session.exec(
            select(CarritoItem, Producto)
            .where(CarritoItem.carrito_id == carrito.id)
            .join(Producto, CarritoItem.producto_id == Producto.id)
        ).all()

        items = []
        # Helpers de centavos para evitar problemas de flotantes
        def to_cents(v: float) -> int:
            return int(round(v * 100))

        def from_cents(c: int) -> float:
            return round(c / 100.0, 2)

        subtotal_cents = 0
        iva_cents = 0

        for item, producto in resultados:
            precio_cents = to_cents(producto.precio)
            cantidad = item.cantidad
            subtotal_item_cents = precio_cents * cantidad
            subtotal_cents += subtotal_item_cents

            categoria = (producto.categoria or "").lower()
            es_electronico = "electr" in categoria
            tasa = 10 if es_electronico else 21
            iva_item_cents = int(round((subtotal_item_cents * tasa) / 100))
            iva_cents += iva_item_cents

            # Item para frontend (mantener subtotales en float para compatibilidad visual)
            items.append(
                {
                    "id": item.id,
                    "producto_id": producto.id,
                    "nombre": producto.titulo,
                    "precio": producto.precio,
                    "cantidad": cantidad,
                    "subtotal": from_cents(subtotal_item_cents),
                    # opcionales útiles para el frontend
                    "imagen": producto.imagen,
                    "existencia": producto.existencia,
                    "categoria": producto.categoria,
                }
            )

        total_sin_envio_cents = subtotal_cents + iva_cents
        envio_cents = 0 if total_sin_envio_cents > 100000 else 5000
        total_cents = total_sin_envio_cents + envio_cents

        return {
            "carrito": {
                "id": carrito.id,
                "usuario_id": current_user_id,
                "estado": carrito.estado,
            },
            "items": items,
            # Subtotales y totales detallados para unificar con frontend
            "subtotal": from_cents(subtotal_cents),
            "iva": from_cents(iva_cents),
            "envio": from_cents(envio_cents),
            "total": from_cents(total_cents),
        }


# ------------------------------
# POST /carrito/cancelar → vaciar carrito
# ------------------------------
@app.post("/carrito/cancelar")
def cancelar_carrito(current_user_id: int = Depends(get_current_user_id)):
    with Session(engine) as session:
        carrito = session.exec(
            select(Carrito).where(
                Carrito.usuario_id == current_user_id, Carrito.estado == "activo"
            )
        ).first()

        if not carrito:
            raise HTTPException(status_code=404, detail="No hay carrito activo")

        items = session.exec(
            select(CarritoItem).where(CarritoItem.carrito_id == carrito.id)
        ).all()

        for it in items:
            session.delete(it)

        carrito.estado = "cancelado"
        session.commit()
        return {"message": "Carrito cancelado y vaciado"}


# ------------------------------
# POST /carrito/finalizar → confirmar compra
# ------------------------------
class FinalizarCompraIn(BaseModel):
    direccion: str
    tarjeta: str


@app.post("/carrito/finalizar")
def finalizar_compra(
    body: FinalizarCompraIn = Body(...),
    current_user_id: int = Depends(get_current_user_id),
):
    with Session(engine) as session:
        carrito = session.exec(
            select(Carrito).where(
                Carrito.usuario_id == current_user_id, Carrito.estado == "activo"
            )
        ).first()

        if not carrito:
            raise HTTPException(status_code=400, detail="No hay carrito activo")

        resultados = session.exec(
            select(CarritoItem, Producto)
            .where(CarritoItem.carrito_id == carrito.id)
            .join(Producto, CarritoItem.producto_id == Producto.id)
        ).all()

        if not resultados:
            raise HTTPException(status_code=400, detail="El carrito está vacío")

        # Calcular subtotal y IVA, verificar stock
        total = 0  # subtotal sin IVA
        iva_total = 0
        for item, producto in resultados:
            if producto.existencia < item.cantidad:
                raise HTTPException(
                    status_code=400, detail=f"Stock insuficiente de {producto.titulo}"
                )
            subtotal_item = producto.precio * item.cantidad
            total += subtotal_item
            # IVA por categoría: electrónicos 10%, resto 21%
            categoria = (producto.categoria or "").lower()
            es_electronico = (
                "electr" in categoria
            )  # cubre electronico/electro/electronica
            tasa_iva = 0.10 if es_electronico else 0.21
            iva_total += subtotal_item * tasa_iva

        # Criterio de envío: gratis si (subtotal + IVA) > 1000, si no $50
        total_con_iva = total + iva_total

        # Crear registro de compra
        compra = Compras(
            usuario_id=current_user_id,
            fecha=datetime.now(timezone.utc).isoformat(),
            direccion=body.direccion,
            tarjeta_ult4=body.tarjeta[-4:] if body.tarjeta else "",
            total=total,  # guardamos subtotal; devolvemos IVA por separado
            envio=0 if total_con_iva > 1000 else 50,
            estado="procesando",
        )
        session.add(compra)
        session.commit()
        session.refresh(compra)

        # Crear items de compra y descontar stock
        for item, producto in resultados:
            producto.existencia -= item.cantidad
            nuevo_item = CompraItem(
                compra_id=compra.id,
                producto_id=producto.id,
                cantidad=item.cantidad,
                nombre_producto=producto.titulo,
                precio_unitario=producto.precio,
            )
            session.add(nuevo_item)

        carrito.estado = "finalizado"
        for item, _ in resultados:
            session.delete(item)

        session.commit()

        return {
            "message": "Compra finalizada correctamente",
            "compra_id": compra.id,
            # Subtotal sin IVA
            "subtotal": round(compra.total, 2),
            # IVA calculado por categorías
            "iva": round(iva_total, 2),
            # Costo de envío aplicado
            "envio": compra.envio,
            # Total final a pagar (subtotal + IVA + envío)
            "total": round(compra.total + iva_total + compra.envio, 2),
        }


# 📦 Compras: resumen y detalle (historial)
@app.get("/compras")
def listar_compras(current_user_id: int = Depends(get_current_user_id)):
    with Session(engine) as session:
        compras = session.exec(
            select(Compras).where(Compras.usuario_id == current_user_id)
        ).all()
        compras = sorted(compras, key=lambda c: c.fecha or "", reverse=True)
        return [
            {
                "id": c.id,
                "usuario_id": c.usuario_id,
                "fecha": c.fecha,
                "direccion": c.direccion,
                "tarjeta": f"**** {c.tarjeta_ult4}" if c.tarjeta_ult4 else "",
                "total": c.total,
                "envio": c.envio,
                "estado": c.estado,
            }
            for c in compras
        ]


@app.get("/compras/{compra_id}")
def detalle_compra(compra_id: int, current_user_id: int = Depends(get_current_user_id)):
    with Session(engine) as session:
        compra = session.get(Compras, compra_id)
        if not compra or compra.usuario_id != current_user_id:
            raise HTTPException(status_code=404, detail="Compra no encontrada")

        items = session.exec(
            select(CompraItem).where(CompraItem.compra_id == compra.id)
        ).all()
        return {
            "id": compra.id,
            "usuario_id": compra.usuario_id,
            "fecha": compra.fecha,
            "direccion": compra.direccion,
            "tarjeta": f"**** {compra.tarjeta_ult4}" if compra.tarjeta_ult4 else "",
            "total": compra.total,
            "envio": compra.envio,
            "estado": compra.estado,
            "items": [
                {
                    "id": it.id,
                    "compra_id": it.compra_id,
                    "producto_id": it.producto_id,
                    "nombre": it.nombre_producto,
                    "cantidad": it.cantidad,
                    "precio_unitario": it.precio_unitario,
                }
                for it in items
            ],
        }


# #Endpoints de Compras
# @app.get("/compras")
# @app.get("/compras/{compra_id}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
