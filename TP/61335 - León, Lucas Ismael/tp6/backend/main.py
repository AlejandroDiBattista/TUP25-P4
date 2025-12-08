from datetime import datetime, timedelta
import json
import os
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, SQLModel, create_engine, select

from models.productos import (
    Carrito,
    Compra,
    ItemCarrito,
    ItemCompra,
    Producto,
    Usuario,
    obtener_aliquota_iva,
)


app = FastAPI(title="API Productos")

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


# =============================
# Configuración de Base de Datos
# =============================
BASE_DIR = Path(__file__).parent
# Permitir override de DB para pruebas mediante variable de entorno
DB_PATH_ENV = os.getenv("DB_PATH")
DB_PATH = Path(DB_PATH_ENV) if DB_PATH_ENV else (BASE_DIR / "ecommerce.db")
engine = create_engine(f"sqlite:///{DB_PATH}", echo=False)


def get_session():
    with Session(engine) as session:
        yield session


def crear_bd_y_tablas():
    SQLModel.metadata.create_all(engine)


def seed_productos(session: Session):
    """Cargar productos desde productos.json si la tabla está vacía."""
    hay = session.exec(select(Producto).limit(1)).first()
    if hay:
        return
    ruta_productos = BASE_DIR / "productos.json"
    with open(ruta_productos, "r", encoding="utf-8") as archivo:
        data = json.load(archivo)
    for p in data:
        prod = Producto(
            id=p["id"],
            titulo=p["titulo"],
            descripcion=p.get("descripcion", ""),
            precio=float(p["precio"]),
            categoria=p.get("categoria", ""),
            valoracion=float(p.get("valoracion", 0)),
            existencia=int(p.get("existencia", 0)),
            imagen=p.get("imagen", ""),
        )
        session.add(prod)
    session.commit()


# =============================
# Dependencias y seguridad
# =============================
SECRET_KEY = "tp6-61335-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/iniciar-sesion")

# Lista negra de tokens (por jti) en memoria
TOKEN_BLACKLIST: set[str] = set()


def verificar_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hashear_password(pwd: str) -> str:
    return pwd_context.hash(pwd)


def crear_token(datos: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = datos.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def obtener_usuario_por_email(session: Session, email: str) -> Optional[Usuario]:
    stmt = select(Usuario).where(Usuario.email == email)
    return session.exec(stmt).first()


def get_current_user(
    token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)
) -> Usuario:
    """Obtiene el usuario autenticado a partir del token JWT."""
    cred_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        jti: str | None = payload.get("jti")
        if jti and jti in TOKEN_BLACKLIST:
            raise cred_exc
        user_id_raw = payload.get("sub")
        if user_id_raw is None:
            raise cred_exc
        try:
            user_id = int(user_id_raw)
        except Exception:
            raise cred_exc
    except JWTError as e:
        raise cred_exc

    user = session.get(Usuario, user_id)
    if not user:
        raise cred_exc
    return user


# =============================
# Esquemas (Pydantic) de solicitud/respuesta
# =============================
class UsuarioCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AgregarAlCarrito(BaseModel):
    producto_id: int
    cantidad: int


class ActualizarCantidadItem(BaseModel):
    producto_id: int
    cantidad: int  # nueva cantidad absoluta (>=0)


class FinalizarCompraData(BaseModel):
    direccion: str
    tarjeta: str


@app.on_event("startup")
def on_startup():
    crear_bd_y_tablas()
    with Session(engine) as session:
        seed_productos(session)


# =============================
# Endpoints básicos
# =============================
@app.get("/")
def root():
    return {"mensaje": "API de Productos - use /productos para obtener el listado"}


@app.get("/productos/{producto_id}")
def obtener_producto(producto_id: int, session: Session = Depends(get_session)):
    prod = session.get(Producto, producto_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return prod


@app.post("/registrar", status_code=201)
def registrar_usuario(datos: UsuarioCreate, session: Session = Depends(get_session)):
    if obtener_usuario_por_email(session, datos.email):
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    user = Usuario(nombre=datos.nombre, email=datos.email, password_hash=hashear_password(datos.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"id": user.id, "nombre": user.nombre, "email": user.email}


@app.post("/iniciar-sesion", response_model=TokenResponse)
def iniciar_sesion(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = obtener_usuario_por_email(session, form_data.username)
    if not user or not verificar_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    jti = f"{user.id}-{int(datetime.utcnow().timestamp())}"
    access_token = crear_token({"sub": str(user.id), "jti": jti})
    return TokenResponse(access_token=access_token)


@app.get("/productos")
def obtener_productos(
    categoria: Optional[str] = Query(None, description="Filtrar por categoría"),
    buscar: Optional[str] = Query(None, description="Texto a buscar en título o descripción"),
    session: Session = Depends(get_session),
):
    stmt = select(Producto)
    if categoria:
        stmt = stmt.where(Producto.categoria.ilike(f"%{categoria}%"))
    if buscar:
        like = f"%{buscar}%"
        stmt = stmt.where((Producto.titulo.ilike(like)) | (Producto.descripcion.ilike(like)))
    stmt = stmt.order_by(Producto.id)
    return session.exec(stmt).all()


@app.post("/cerrar-sesion")
def cerrar_sesion(token: str = Depends(oauth2_scheme)):
    """Cerrar sesión invalidando el token actual (lista negra)."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        jti = payload.get("jti")
        if jti:
            TOKEN_BLACKLIST.add(jti)
    except JWTError:
        pass
    return {"mensaje": "Sesión cerrada"}


# =============================
# Carrito de compras
# =============================
def obtener_o_crear_carrito_abierto(session: Session, usuario_id: int) -> Carrito:
    stmt = select(Carrito).where(Carrito.usuario_id == usuario_id, Carrito.estado == "abierto")
    carrito = session.exec(stmt).first()
    if not carrito:
        carrito = Carrito(usuario_id=usuario_id, estado="abierto")
        session.add(carrito)
        session.commit()
        session.refresh(carrito)
    return carrito


def calcular_resumen_carrito(session: Session, carrito: Carrito):
    """Devuelve un resumen con subtotal, iva, envío y total."""
    items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all()
    subtotal = 0.0
    iva_total = 0.0
    for it in items:
        prod = session.get(Producto, it.producto_id)
        linea = it.precio_unitario * it.cantidad
        subtotal += linea
        iva_total += obtener_aliquota_iva(prod.categoria) * it.precio_unitario * it.cantidad

    # Si no hay items, el envío debe ser 0. Caso contrario: gratis si subtotal>1000, sino $50.
    envio = 0.0 if not items else (0.0 if subtotal > 1000 else 50.0)
    total = subtotal + iva_total + envio

    # Representación amigable
    items_detalle = []
    for it in items:
        prod = session.get(Producto, it.producto_id)
        linea_subtotal = it.precio_unitario * it.cantidad
        aliq = obtener_aliquota_iva(prod.categoria)
        iva_linea = aliq * it.precio_unitario * it.cantidad
        items_detalle.append(
            {
                "producto_id": it.producto_id,
                "titulo": prod.titulo,
                "imagen": prod.imagen,
                "cantidad": it.cantidad,
                "precio_unitario": it.precio_unitario,
                "subtotal": linea_subtotal,
                "iva": iva_linea,
            }
        )

    return {
        "items": items_detalle,
        "subtotal": round(subtotal, 2),
        "iva": round(iva_total, 2),
        "envio": round(envio, 2),
        "total": round(total, 2),
    }


@app.get("/carrito")
def ver_carrito(user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    carrito = obtener_o_crear_carrito_abierto(session, user.id)
    return calcular_resumen_carrito(session, carrito)


@app.post("/carrito", status_code=201)
def agregar_al_carrito(
    body: AgregarAlCarrito,
    user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    prod = session.get(Producto, body.producto_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if prod.existencia <= 0 or body.cantidad > prod.existencia:
        raise HTTPException(status_code=400, detail="No hay existencia suficiente")

    carrito = obtener_o_crear_carrito_abierto(session, user.id)
    # Buscar si ya existe el ítem para ese producto
    stmt = select(ItemCarrito).where(
        ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == prod.id
    )
    item = session.exec(stmt).first()
    if item:
        item.cantidad += body.cantidad
    else:
        item = ItemCarrito(
            carrito_id=carrito.id,
            producto_id=prod.id,
            cantidad=body.cantidad,
            precio_unitario=prod.precio,
        )
        session.add(item)
    session.commit()
    return {"mensaje": "Producto agregado"}

@app.patch("/carrito")
def actualizar_cantidad_item(
    body: ActualizarCantidadItem,
    user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if body.cantidad < 0:
        raise HTTPException(status_code=400, detail="Cantidad inválida")
    carrito = obtener_o_crear_carrito_abierto(session, user.id)
    stmt = select(ItemCarrito).where(
        ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == body.producto_id
    )
    item = session.exec(stmt).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado en el carrito")
    # Si la cantidad es 0 eliminar el ítem
    if body.cantidad == 0:
        session.delete(item)
        session.commit()
        return {"mensaje": "Item eliminado"}
    # Validar stock disponible
    prod = session.get(Producto, body.producto_id)
    if not prod or body.cantidad > prod.existencia:
        raise HTTPException(status_code=400, detail="No hay existencia suficiente")
    item.cantidad = body.cantidad
    session.add(item)
    session.commit()
    return {"mensaje": "Cantidad actualizada"}


@app.delete("/carrito/{producto_id}")
def quitar_del_carrito(
    producto_id: int,
    user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    carrito = obtener_o_crear_carrito_abierto(session, user.id)
    stmt = select(ItemCarrito).where(
        ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == producto_id
    )
    item = session.exec(stmt).first()
    if not item:
        raise HTTPException(status_code=404, detail="El producto no está en el carrito")
    session.delete(item)
    session.commit()
    return {"mensaje": "Producto eliminado del carrito"}


@app.post("/carrito/cancelar")
def cancelar_carrito(user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    carrito = obtener_o_crear_carrito_abierto(session, user.id)
    # Vaciar el carrito
    items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all()
    for it in items:
        session.delete(it)
    session.commit()
    return {"mensaje": "Carrito cancelado"}


@app.post("/carrito/finalizar")
def finalizar_compra(
    datos: FinalizarCompraData,
    user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    carrito = obtener_o_crear_carrito_abierto(session, user.id)
    items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all()
    if not items:
        raise HTTPException(status_code=400, detail="El carrito está vacío")

    resumen = calcular_resumen_carrito(session, carrito)

    # Enmascarar tarjeta
    mascarada = ("*" * (len(datos.tarjeta) - 4)) + datos.tarjeta[-4:]
    compra = Compra(
        usuario_id=user.id,
        direccion=datos.direccion,
        tarjeta=mascarada,
        subtotal=resumen["subtotal"],
        iva=resumen["iva"],
        envio=resumen["envio"],
        total=resumen["total"],
    )
    session.add(compra)
    session.commit()
    session.refresh(compra)

    # Crear items de compra y descontar stock
    for it in items:
        prod = session.get(Producto, it.producto_id)
        if it.cantidad > prod.existencia:
            raise HTTPException(status_code=400, detail=f"Sin stock para {prod.titulo}")
        prod.existencia -= it.cantidad
        session.add(
            ItemCompra(
                compra_id=compra.id,
                producto_id=prod.id,
                cantidad=it.cantidad,
                precio_unitario=it.precio_unitario,
            )
        )
        session.delete(it)
    # Cerrar carrito
    carrito.estado = "cerrado"
    session.add(carrito)
    session.commit()

    return {"mensaje": "Compra finalizada", "compra_id": compra.id}


# =============================
# Compras (historial)
# =============================
@app.get("/compras")
def listar_compras(user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    stmt = select(Compra).where(Compra.usuario_id == user.id).order_by(Compra.fecha.desc())
    compras = session.exec(stmt).all()
    return compras


@app.get("/compras/{compra_id}")
def detalle_compra(compra_id: int, user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    compra = session.get(Compra, compra_id)
    if not compra or compra.usuario_id != user.id:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    items = session.exec(select(ItemCompra).where(ItemCompra.compra_id == compra.id)).all()
    # Enriquecer items con título de producto y subtotal para la vista de historial
    items_detalle = []
    for it in items:
        prod = session.get(Producto, it.producto_id)
        items_detalle.append({
            "producto_id": it.producto_id,
            "titulo": prod.titulo if prod else f"Producto {it.producto_id}",
            "cantidad": it.cantidad,
            "precio_unitario": it.precio_unitario,
            "subtotal": it.cantidad * it.precio_unitario,
        })
    return {"compra": compra, "items": items_detalle}


# =============================
# Usuario actual
# =============================
@app.get("/me")
def me(user: Usuario = Depends(get_current_user)):
    return {"id": user.id, "nombre": user.nombre, "email": user.email}


# =============================
# Endpoints de depuración (desarrollo)
# =============================
# (Endpoints de depuración removidos para la entrega.)
