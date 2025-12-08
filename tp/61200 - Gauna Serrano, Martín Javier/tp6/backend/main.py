from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from pathlib import Path
import json
from typing import Optional, List

from sqlmodel import Session, select

from models.productos import (
    Producto,
    Usuario,
    Carrito,
    ItemCarrito,
    Compra,
    ItemCompra,
)

from database import create_db_and_tables, engine
from auth import obtener_hash_contraseña, verificar_contraseña, crear_access_token
from dependencies import get_current_user

# =========================================================
# APP
# =========================================================

app = FastAPI(title="API Productos")

# Servir imágenes estáticas
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# MODELOS REQUEST / RESPONSE
# =========================================================

class RegistroRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    nombre: str = Field(min_length=3)
    email: EmailStr
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    nombre: str
    email: EmailStr


class MensajeResponse(BaseModel):
    mensaje: str


class AgregarCarritoRequest(BaseModel):
    producto_id: int
    cantidad: int = Field(gt=0)


class ActualizarCarritoRequest(BaseModel):
    cantidad: int = Field(ge=0)


class ItemCarritoResponse(BaseModel):
    producto_id: int
    nombre: str
    categoria: str
    precio: float
    cantidad: int
    subtotal: float
    stock_disponible: int
    imagen: str


class CarritoResponse(BaseModel):
    items: List[ItemCarritoResponse]
    subtotal: float
    iva: float
    envio: float
    total: float


class FinalizarCompraRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    direccion: str = Field(min_length=8)
    tarjeta: str = Field(pattern=r"^\d{16}$")


class CompraResponse(BaseModel):
    compra_id: int
    subtotal: float
    iva: float
    envio: float
    total: float


class ItemCompraResponse(BaseModel):
    producto_id: int
    nombre: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class CompraResumenResponse(BaseModel):
    id: int
    fecha: str
    total: float
    envio: float
    cantidad_items: int


class CompraDetalleResponse(BaseModel):
    id: int
    fecha: str
    direccion: str
    tarjeta: str
    items: List[ItemCompraResponse]
    subtotal: float
    envio: float
    total: float


class UsuarioActualResponse(BaseModel):
    nombre: str
    email: EmailStr


# =========================================================
# STARTUP
# =========================================================

@app.on_event("startup")
def startup_event() -> None:
    """Crear tablas y cargar productos iniciales si la tabla está vacía."""
    create_db_and_tables()

    with Session(engine) as session:
        existe = session.exec(select(Producto)).first()
        if existe:
            return

        ruta = Path(__file__).parent / "productos.json"
        with open(ruta, "r", encoding="utf-8") as f:
            productos_json = json.load(f)

        for p in productos_json:
            prod = Producto(
                id=p["id"],
                nombre=p["titulo"],
                descripcion=p["descripcion"],
                precio=p["precio"],
                categoria=p["categoria"],
                existencia=p["existencia"],
                imagen=p["imagen"],
            )
            session.add(prod)

        session.commit()
        print(f"Productos cargados: {len(productos_json)}")


@app.get("/")
def root():
    return {"mensaje": "API funcionando. Endpoints principales: /productos, /carrito, /compras"}


# =========================================================
# PRODUCTOS
# =========================================================

@app.get("/productos")
def obtener_productos(categoria: Optional[str] = None, buscar: Optional[str] = None):
    with Session(engine) as session:
        query = select(Producto)

        if categoria:
            query = query.where(Producto.categoria.ilike(f"%{categoria}%"))

        if buscar:
            query = query.where(
                Producto.nombre.ilike(f"%{buscar}%")
                | Producto.descripcion.ilike(f"%{buscar}%")
            )

        return session.exec(query).all()


@app.get("/productos/{producto_id}")
def obtener_producto(producto_id: int):
    with Session(engine) as session:
        producto = session.get(Producto, producto_id)
        if not producto:
            raise HTTPException(404, "Producto no encontrado")
        return producto


# =========================================================
# AUTENTICACIÓN
# =========================================================

@app.post("/registrar", response_model=MensajeResponse, status_code=201)
def registrar(datos: RegistroRequest):
    with Session(engine) as session:
        existe = session.exec(
            select(Usuario).where(Usuario.email == datos.email)
        ).first()
        if existe:
            raise HTTPException(400, "El email ya existe")

        usuario = Usuario(
            nombre=datos.nombre,
            email=datos.email,
            contraseña=obtener_hash_contraseña(datos.password),
        )
        session.add(usuario)
        session.commit()
        session.refresh(usuario)

        # Crear carrito activo inicial
        carrito = Carrito(usuario_id=usuario.id, estado="activo")
        session.add(carrito)
        session.commit()

        return MensajeResponse(mensaje="Usuario registrado correctamente")


@app.post("/iniciar-sesion", response_model=TokenResponse)
def login(datos: LoginRequest):
    with Session(engine) as session:
        user = session.exec(
            select(Usuario).where(Usuario.email == datos.email)
        ).first()

        if not user or not verificar_contraseña(datos.password, user.contraseña):
            raise HTTPException(401, "Credenciales inválidas")

        token = crear_access_token({"sub": user.email})

        return TokenResponse(
            access_token=token,
            nombre=user.nombre,
            email=user.email,
        )


@app.get("/usuarios/me", response_model=UsuarioActualResponse)
def usuario_actual(usuario=Depends(get_current_user)):
    return UsuarioActualResponse(nombre=usuario.nombre, email=usuario.email)


# =========================================================
# CARRITO
# =========================================================

@app.get("/carrito", response_model=CarritoResponse)
def ver_carrito(usuario=Depends(get_current_user)):
    with Session(engine) as session:
        carrito = session.exec(
            select(Carrito).where(
                Carrito.usuario_id == usuario.id,
                Carrito.estado == "activo",
            )
        ).first()

        if not carrito:
            return CarritoResponse(items=[], subtotal=0, iva=0, envio=0, total=0)

        items = session.exec(
            select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)
        ).all()

        items_resp: List[ItemCarritoResponse] = []
        subtotal = 0.0
        iva_total = 0.0

        for item in items:
            producto = session.get(Producto, item.producto_id)
            if not producto:
                continue

            st = producto.precio * item.cantidad
            subtotal += st

            iva = st * (0.10 if producto.categoria == "Electrónica" else 0.21)
            iva_total += iva

            items_resp.append(
                ItemCarritoResponse(
                    producto_id=producto.id,
                    nombre=producto.nombre,
                    categoria=producto.categoria,
                    precio=producto.precio,
                    cantidad=item.cantidad,
                    subtotal=st,
                    stock_disponible=producto.existencia,
                    imagen=producto.imagen,
                )
            )

        envio = 0 if subtotal > 1000 else (50 if subtotal > 0 else 0)
        total = subtotal + iva_total + envio

        return CarritoResponse(
            items=items_resp,
            subtotal=subtotal,
            iva=iva_total,
            envio=envio,
            total=total,
        )


@app.post("/carrito/agregar", response_model=MensajeResponse)
def agregar_carrito(data: AgregarCarritoRequest, usuario=Depends(get_current_user)):
    with Session(engine) as session:
        carrito = session.exec(
            select(Carrito).where(
                Carrito.usuario_id == usuario.id,
                Carrito.estado == "activo",
            )
        ).first()

        if not carrito:
            carrito = Carrito(usuario_id=usuario.id, estado="activo")
            session.add(carrito)
            session.commit()
            session.refresh(carrito)

        producto = session.get(Producto, data.producto_id)
        if not producto:
            raise HTTPException(404, "Producto no encontrado")

        if producto.existencia < data.cantidad:
            raise HTTPException(400, "No hay stock suficiente")

        item = session.exec(
            select(ItemCarrito).where(
                ItemCarrito.carrito_id == carrito.id,
                ItemCarrito.producto_id == data.producto_id,
            )
        ).first()

        if item:
            nueva_cantidad = item.cantidad + data.cantidad
            if nueva_cantidad > producto.existencia:
                raise HTTPException(400, "Stock insuficiente")
            item.cantidad = nueva_cantidad
        else:
            item = ItemCarrito(
                carrito_id=carrito.id,
                producto_id=data.producto_id,
                cantidad=data.cantidad,
            )
            session.add(item)

        session.commit()

        return MensajeResponse(mensaje="Producto agregado al carrito correctamente")


@app.put("/carrito/{producto_id}", response_model=MensajeResponse)
def actualizar_cantidad(
    producto_id: int,
    data: ActualizarCarritoRequest,
    usuario=Depends(get_current_user),
):
    with Session(engine) as session:
        carrito = session.exec(
            select(Carrito).where(
                Carrito.usuario_id == usuario.id,
                Carrito.estado == "activo",
            )
        ).first()

        if not carrito:
            raise HTTPException(404, "Carrito no encontrado")

        item = session.exec(
            select(ItemCarrito).where(
                ItemCarrito.carrito_id == carrito.id,
                ItemCarrito.producto_id == producto_id,
            )
        ).first()

        if not item:
            raise HTTPException(404, "Producto no está en el carrito")

        if data.cantidad == 0:
            session.delete(item)
            session.commit()
            return MensajeResponse(mensaje="Producto eliminado")

        producto = session.get(Producto, producto_id)
        if not producto:
            raise HTTPException(404, "Producto no encontrado")

        if data.cantidad > producto.existencia:
            raise HTTPException(400, "Stock insuficiente")

        item.cantidad = data.cantidad
        session.commit()

        return MensajeResponse(mensaje="Cantidad actualizada correctamente")


@app.delete("/carrito/quitar/{producto_id}", response_model=MensajeResponse)
def quitar_item_carrito(producto_id: int, usuario=Depends(get_current_user)):
    with Session(engine) as session:
        carrito = session.exec(
            select(Carrito).where(
                Carrito.usuario_id == usuario.id,
                Carrito.estado == "activo",
            )
        ).first()

        if not carrito:
            raise HTTPException(404, "No tienes un carrito activo")

        item = session.exec(
            select(ItemCarrito).where(
                ItemCarrito.carrito_id == carrito.id,
                ItemCarrito.producto_id == producto_id,
            )
        ).first()

        if not item:
            raise HTTPException(404, "El producto no está en el carrito")

        session.delete(item)
        session.commit()

        return MensajeResponse(mensaje="Producto eliminado del carrito")


@app.post("/carrito/cancelar", response_model=MensajeResponse)
def cancelar_carrito(usuario=Depends(get_current_user)):
    """Vacía el carrito activo sin borrarlo (para 'Vaciar carrito')."""
    with Session(engine) as session:
        carrito = session.exec(
            select(Carrito).where(
                Carrito.usuario_id == usuario.id,
                Carrito.estado == "activo",
            )
        ).first()

        if not carrito:
            return MensajeResponse(mensaje="No hay carrito para cancelar")

        for item in list(carrito.items):
            session.delete(item)

        session.commit()

        return MensajeResponse(mensaje="Carrito vaciado correctamente")


# =========================================================
# FINALIZAR COMPRA
# =========================================================

@app.post("/carrito/finalizar", response_model=CompraResponse)
def finalizar_compra(data: FinalizarCompraRequest, usuario=Depends(get_current_user)):
    """
    Finaliza la compra:
    - Calcula subtotal, IVA y envío
    - Descuenta stock
    - Crea la Compra e Items de compra
    - Vacía el carrito activo
    """
    with Session(engine) as session:
        carrito = session.exec(
            select(Carrito).where(
                Carrito.usuario_id == usuario.id,
                Carrito.estado == "activo",
            )
        ).first()

        if not carrito or len(carrito.items) == 0:
            raise HTTPException(400, "El carrito está vacío")

        subtotal = 0.0
        iva_total = 0.0

        # Verificamos stock y calculamos montos
        for item in carrito.items:
            producto = session.get(Producto, item.producto_id)
            if not producto:
                raise HTTPException(400, "Producto del carrito ya no existe")

            if producto.existencia < item.cantidad:
                raise HTTPException(400, "Stock insuficiente al finalizar compra")

            st = producto.precio * item.cantidad
            subtotal += st
            iva_total += st * (0.10 if producto.categoria == "Electrónica" else 0.21)

        envio = 0 if subtotal > 1000 else (50 if subtotal > 0 else 0)
        total = subtotal + iva_total + envio

        # Crear compra
        compra = Compra(
            usuario_id=usuario.id,
            direccion=data.direccion,
            tarjeta=data.tarjeta,
            total=total,
            envio=envio,
        )
        session.add(compra)
        session.commit()
        session.refresh(compra)

        # Crear items de compra y descontar stock
        for item in list(carrito.items):
            producto = session.get(Producto, item.producto_id)
            if not producto:
                continue

            producto.existencia -= item.cantidad

            item_compra = ItemCompra(
                compra_id=compra.id,
                producto_id=producto.id,
                cantidad=item.cantidad,
                nombre=producto.nombre,
                precio_unitario=producto.precio,
            )
            session.add(item_compra)
            session.delete(item)

        session.commit()

        return CompraResponse(
            compra_id=compra.id,
            subtotal=subtotal,
            iva=iva_total,
            envio=envio,
            total=total,
        )


# =========================================================
# HISTORIAL DE COMPRAS
# =========================================================

@app.get("/compras", response_model=List[CompraResumenResponse])
def compras(usuario=Depends(get_current_user)):
    with Session(engine) as session:
        datos = session.exec(
            select(Compra).where(Compra.usuario_id == usuario.id)
        ).all()

        respuesta = [
            CompraResumenResponse(
                id=c.id,
                fecha=c.fecha.isoformat(),
                total=c.total,
                envio=c.envio,
                cantidad_items=len(c.items),
            )
            for c in datos
        ]

        respuesta.sort(key=lambda x: x.fecha, reverse=True)
        return respuesta


@app.get("/compras/{compra_id}", response_model=CompraDetalleResponse)
def detalle(compra_id: int, usuario=Depends(get_current_user)):
    with Session(engine) as session:
        compra = session.get(Compra, compra_id)

        if not compra:
            raise HTTPException(404, "Compra no encontrada")

        if compra.usuario_id != usuario.id:
            raise HTTPException(403, "No autorizado")

        items_resp: List[ItemCompraResponse] = []
        subtotal = 0.0

        for item in compra.items:
            st = item.precio_unitario * item.cantidad
            subtotal += st

            items_resp.append(
                ItemCompraResponse(
                    producto_id=item.producto_id,
                    nombre=item.nombre,
                    precio_unitario=item.precio_unitario,
                    cantidad=item.cantidad,
                    subtotal=st,
                )
            )

        return CompraDetalleResponse(
            id=compra.id,
            fecha=compra.fecha.isoformat(),
            direccion=compra.direccion,
            tarjeta=compra.tarjeta,
            items=items_resp,
            subtotal=subtotal,
            envio=compra.envio,
            total=compra.total,
        )


# =========================================================
# EJECUCIÓN LOCAL
# =========================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
