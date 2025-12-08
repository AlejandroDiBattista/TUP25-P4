import hashlib
import json
import secrets
from pathlib import Path
from typing import Dict

from fastapi import Cookie, Depends, FastAPI, Header, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select

from database import create_db_and_tables, get_session
from models import Compra, CompraItem, Usuario


class CartItemPayload(BaseModel):
    producto_id: int
    cantidad: int


class CompraRequest(BaseModel):
    direccion: str
    tarjeta: str
    items: list[CartItemPayload]


class CompraResponse(BaseModel):
    id: int
    subtotal: float
    iva: float
    envio: float
    total: float


class CompraItemResponse(BaseModel):
    producto_id: int
    nombre: str
    precio_unitario: float
    cantidad: int
    categoria: str | None = None


class CompraDetalleResponse(BaseModel):
    id: int
    fecha: str
    direccion: str
    tarjeta: str
    subtotal: float
    iva: float
    envio: float
    total: float
    items: list[CompraItemResponse]


class CarritoAddRequest(BaseModel):
    producto_id: int
    cantidad: int = 1


class CarritoItemInfo(BaseModel):
    producto_id: int
    nombre: str
    cantidad: int
    precio_unitario: float
    subtotal: float
    iva: float


class CarritoResponse(BaseModel):
    items: list[CarritoItemInfo]
    subtotal: float
    iva: float
    envio: float
    total: float


class CarritoFinalizarRequest(BaseModel):
    direccion: str
    tarjeta: str


class CarritoCheckoutResponse(BaseModel):
    compra_id: int
    subtotal: float
    iva: float
    envio: float
    total: float


class RegistroRequest(BaseModel):
    nombre: str
    email: EmailStr
    password: str


class RegistroResponse(BaseModel):
    id: int
    nombre: str
    email: EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    nombre: str
    token_type: str = "bearer"


IVA_GENERAL = 0.21
IVA_ELECTRONICA = 0.10
ELECTRONICS_CATEGORY = "electrónica"
FREE_SHIPPING_THRESHOLD = 1000.0
SHIPPING_FLAT_COST = 50.0

# Tokens en memoria.
TOKENS: Dict[str, int] = {}
# Carritos en memoria (usuario_id -> {producto_id: cantidad})
CARRITOS: Dict[int, Dict[int, int]] = {}

# Hash de la contraseña
def hash_password(password: str) -> str:
    """Devuelve un hash estable para la contraseña ingresada."""

    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(password: str, hashed_password: str) -> bool:
    return hash_password(password) == hashed_password


app = FastAPI(title="API Productos")

# Montar directorio de imágenes como archivos estáticos
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar productos desde el archivo JSON
def cargar_productos() -> list[dict]:
    ruta_productos = Path(__file__).parent / "productos.json"
    with open(ruta_productos, "r", encoding="utf-8") as archivo:
        return json.load(archivo)


def guardar_productos(productos: list[dict]) -> None:
    """Persiste el catálogo actualizado (por ejemplo, tras descontar stock)."""
    ruta_productos = Path(__file__).parent / "productos.json"
    with open(ruta_productos, "w", encoding="utf-8") as archivo:
        json.dump(productos, archivo, ensure_ascii=False, indent=2)


def obtener_carrito_usuario(usuario_id: int) -> Dict[int, int]:
    """Devuelve el carrito en memoria para el usuario (lo crea si no existe)."""

    return CARRITOS.setdefault(usuario_id, {})


def construir_resumen_carrito(carrito: Dict[int, int]) -> CarritoResponse:
    productos_lista = cargar_productos()
    productos_por_id = {producto["id"]: producto for producto in productos_lista}

    subtotal = 0.0
    total_iva = 0.0
    items: list[CarritoItemInfo] = []
    productos_a_remover: list[int] = []

    for producto_id, cantidad in carrito.items():
        producto = productos_por_id.get(producto_id)
        if not producto:
            productos_a_remover.append(producto_id)
            continue

        precio_unitario = float(producto.get("precio", 0.0))
        item_subtotal = precio_unitario * cantidad
        es_electronica = producto.get("categoria", "").strip().lower() == ELECTRONICS_CATEGORY
        tasa_iva = IVA_ELECTRONICA if es_electronica else IVA_GENERAL
        item_iva = item_subtotal * tasa_iva

        subtotal += item_subtotal
        total_iva += item_iva

        items.append(
            CarritoItemInfo(
                producto_id=producto_id,
                nombre=producto.get("titulo", ""),
                cantidad=cantidad,
                precio_unitario=precio_unitario,
                subtotal=round(item_subtotal, 2),
                iva=round(item_iva, 2),
            )
        )

    for producto_id in productos_a_remover:
        carrito.pop(producto_id, None)

    total_pre_envio = subtotal + total_iva
    envio = 0.0 if subtotal == 0.0 else (0.0 if total_pre_envio > FREE_SHIPPING_THRESHOLD else SHIPPING_FLAT_COST)
    total = total_pre_envio + envio

    return CarritoResponse(
        items=items,
        subtotal=round(subtotal, 2),
        iva=round(total_iva, 2),
        envio=round(envio, 2),
        total=round(total, 2),
    )


def procesar_compra(
    items: list[CartItemPayload],
    direccion: str,
    tarjeta: str,
    session: Session,
    usuario: Usuario,
) -> CompraResponse:
    direccion_limpia = direccion.strip()
    tarjeta_limpia = tarjeta.strip()

    if not direccion_limpia or not tarjeta_limpia:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Dirección y tarjeta son obligatorias")

    if not items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El carrito no puede estar vacío")

    productos_lista = cargar_productos()
    productos_por_id = {producto["id"]: producto for producto in productos_lista}

    subtotal = 0.0
    total_iva = 0.0
    items_a_guardar: list[CompraItem] = []

    for item in items:
        producto = productos_por_id.get(item.producto_id)
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto con id {item.producto_id} no existe",
            )

        if item.cantidad < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La cantidad debe ser al menos 1",
            )

        stock_disponible = int(producto.get("existencia", 0))
        if stock_disponible < item.cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No hay stock suficiente para {producto.get('titulo', 'producto')}",
            )

        precio_unitario = float(producto.get("precio", 0.0))
        item_subtotal = precio_unitario * item.cantidad
        subtotal += item_subtotal

        es_electronica = producto.get("categoria", "").strip().lower() == ELECTRONICS_CATEGORY
        tasa_iva = IVA_ELECTRONICA if es_electronica else IVA_GENERAL
        total_iva += item_subtotal * tasa_iva

        producto["existencia"] = stock_disponible - item.cantidad

        items_a_guardar.append(
            CompraItem(
                producto_id=item.producto_id,
                nombre=producto.get("titulo", ""),
                precio_unitario=precio_unitario,
                cantidad=item.cantidad,
            )
        )

    total_antes_envio = subtotal + total_iva
    envio = 0.0 if subtotal == 0.0 else (0.0 if total_antes_envio > FREE_SHIPPING_THRESHOLD else SHIPPING_FLAT_COST)
    total = total_antes_envio + envio

    compra = Compra(
        usuario_id=usuario.id,
        direccion=direccion_limpia,
        tarjeta=tarjeta_limpia,
        total=round(total, 2),
        envio=envio,
    )

    session.add(compra)
    session.flush()

    for compra_item in items_a_guardar:
        compra_item.compra_id = compra.id
        session.add(compra_item)

    session.commit()
    session.refresh(compra)

    guardar_productos(productos_lista)

    return CompraResponse(
        id=compra.id,
        subtotal=round(subtotal, 2),
        iva=round(total_iva, 2),
        envio=round(envio, 2),
        total=round(total, 2),
    )


def construir_detalle_compra(
    compra: Compra,
    session: Session,
    productos_catalogo: dict[int, dict],
) -> CompraDetalleResponse:
    compra_items = session.exec(select(CompraItem).where(CompraItem.compra_id == compra.id)).all()

    subtotal = 0.0
    total_iva = 0.0
    items_respuesta: list[CompraItemResponse] = []

    for item in compra_items:
        precio_total_item = item.precio_unitario * item.cantidad
        subtotal += precio_total_item

        producto_catalogo = productos_catalogo.get(item.producto_id)
        es_electronica = False
        if producto_catalogo:
            es_electronica = producto_catalogo.get("categoria", "").strip().lower() == ELECTRONICS_CATEGORY

        tasa_iva = IVA_ELECTRONICA if es_electronica else IVA_GENERAL
        total_iva += precio_total_item * tasa_iva

        items_respuesta.append(
            CompraItemResponse(
                producto_id=item.producto_id,
                nombre=item.nombre,
                precio_unitario=item.precio_unitario,
                cantidad=item.cantidad,
                categoria=producto_catalogo.get("categoria") if producto_catalogo else None,
            )
        )

    envio_valor = float(compra.envio or 0.0)
    total_valor = float(compra.total or subtotal + total_iva + envio_valor)

    fecha_iso = compra.fecha.isoformat() if getattr(compra, "fecha", None) else ""

    return CompraDetalleResponse(
        id=compra.id,
        fecha=fecha_iso,
        direccion=compra.direccion,
        tarjeta=compra.tarjeta,
        subtotal=round(subtotal, 2),
        iva=round(total_iva, 2),
        envio=round(envio_valor, 2),
        total=round(total_valor, 2),
        items=items_respuesta,
    )

# Registro de usuarios
@app.post("/registrar", response_model=RegistroResponse, status_code=status.HTTP_201_CREATED)
def registrar_usuario(
    payload: RegistroRequest,
    session: Session = Depends(get_session),
) -> RegistroResponse:
    """Crea un nuevo usuario con la contraseña hasheada."""

    existente = session.exec(select(Usuario).where(Usuario.email == payload.email)).first()
    if existente:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El email ya está registrado")

    usuario = Usuario(
        nombre=payload.nombre,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    session.add(usuario)
    session.commit()
    session.refresh(usuario)

    return RegistroResponse(id=usuario.id, nombre=usuario.nombre, email=usuario.email)

# Inicio de sesión
@app.post("/iniciar-sesion", response_model=TokenResponse)
def iniciar_sesion(
    payload: LoginRequest,
    response: Response,
    session: Session = Depends(get_session),
) -> TokenResponse:
    """Verifica credenciales y devuelve un token en memoria."""

    usuario = session.exec(select(Usuario).where(Usuario.email == payload.email)).first()
    if not usuario or not verify_password(payload.password, usuario.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    token = secrets.token_hex(32)
    TOKENS[token] = usuario.id

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24,
    )

    return TokenResponse(access_token=token, nombre=usuario.nombre)


@app.post("/cerrar-sesion", status_code=status.HTTP_204_NO_CONTENT)
def cerrar_sesion(
    response: Response,
    authorization: str | None = Header(default=None, alias="Authorization"),
    access_token: str | None = Cookie(default=None, alias="access_token"),
) -> None:
    token: str | None = None

    if authorization:
        scheme, _, candidate = authorization.partition(" ")
        if scheme.lower() == "bearer" and candidate:
            token = candidate

    if not token and access_token:
        token = access_token

    if token and token in TOKENS:
        TOKENS.pop(token, None)

    response.delete_cookie("access_token")

def get_current_user(
    authorization: str | None = Header(default=None, alias="Authorization"),
    access_token: str | None = Cookie(default=None, alias="access_token"),
    session: Session = Depends(get_session),
) -> Usuario:
    token: str | None = None

    if authorization:
        scheme, _, candidate = authorization.partition(" ")
        if scheme.lower() == "bearer" and candidate:
            token = candidate
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    if not token and access_token:
        token = access_token

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token faltante")

    usuario_id = TOKENS.get(token)
    if not usuario_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    usuario = session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")

    return usuario


@app.get("/carrito", response_model=CarritoResponse)
def obtener_carrito(
    usuario: Usuario = Depends(get_current_user),
) -> CarritoResponse:
    carrito = obtener_carrito_usuario(usuario.id)
    return construir_resumen_carrito(carrito)


@app.post("/carrito", response_model=CarritoResponse, status_code=status.HTTP_201_CREATED)
def agregar_al_carrito(
    payload: CarritoAddRequest,
    usuario: Usuario = Depends(get_current_user),
) -> CarritoResponse:
    if payload.cantidad < 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La cantidad debe ser al menos 1")

    carrito = obtener_carrito_usuario(usuario.id)
    productos = {producto["id"]: producto for producto in cargar_productos()}
    producto = productos.get(payload.producto_id)

    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

    stock_disponible = int(producto.get("existencia", 0))
    cantidad_actual = int(carrito.get(payload.producto_id, 0))
    nueva_cantidad = cantidad_actual + payload.cantidad

    if stock_disponible < nueva_cantidad:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No hay stock suficiente")

    carrito[payload.producto_id] = nueva_cantidad
    return construir_resumen_carrito(carrito)


@app.delete("/carrito/{producto_id}", response_model=CarritoResponse)
def quitar_del_carrito(
    producto_id: int,
    usuario: Usuario = Depends(get_current_user),
) -> CarritoResponse:
    carrito = obtener_carrito_usuario(usuario.id)
    carrito.pop(producto_id, None)
    return construir_resumen_carrito(carrito)


@app.post("/carrito/cancelar", response_model=CarritoResponse)
def cancelar_carrito(
    usuario: Usuario = Depends(get_current_user),
) -> CarritoResponse:
    carrito = obtener_carrito_usuario(usuario.id)
    carrito.clear()
    return construir_resumen_carrito(carrito)


@app.post("/carrito/finalizar", response_model=CarritoCheckoutResponse)
def finalizar_carrito(
    payload: CarritoFinalizarRequest,
    session: Session = Depends(get_session),
    usuario: Usuario = Depends(get_current_user),
) -> CarritoCheckoutResponse:
    carrito = obtener_carrito_usuario(usuario.id)
    if not carrito:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El carrito está vacío")

    items_payload = [
        CartItemPayload(producto_id=producto_id, cantidad=cantidad)
        for producto_id, cantidad in carrito.items()
    ]

    compra = procesar_compra(
        items=items_payload,
        direccion=payload.direccion,
        tarjeta=payload.tarjeta,
        session=session,
        usuario=usuario,
    )

    carrito.clear()

    return CarritoCheckoutResponse(
        compra_id=compra.id,
        subtotal=compra.subtotal,
        iva=compra.iva,
        envio=compra.envio,
        total=compra.total,
    )


@app.post("/compras", response_model=CompraResponse, status_code=status.HTTP_201_CREATED)
def crear_compra(
    payload: CompraRequest,
    session: Session = Depends(get_session),
    usuario: Usuario = Depends(get_current_user),
) -> CompraResponse:
    return procesar_compra(
        items=payload.items,
        direccion=payload.direccion,
        tarjeta=payload.tarjeta,
        session=session,
        usuario=usuario,
    )

# Listar compras del usuario actual
@app.get("/compras", response_model=list[CompraDetalleResponse])
def listar_compras(
    session: Session = Depends(get_session),
    usuario: Usuario = Depends(get_current_user),
) -> list[CompraDetalleResponse]:
    productos = {producto["id"]: producto for producto in cargar_productos()}

    compras = session.exec(
        select(Compra)
        .where(Compra.usuario_id == usuario.id)
        .order_by(Compra.fecha.desc())
    ).all()

    return [construir_detalle_compra(compra, session, productos) for compra in compras]


@app.get("/compras/{compra_id}", response_model=CompraDetalleResponse)
def obtener_compra(
    compra_id: int,
    session: Session = Depends(get_session),
    usuario: Usuario = Depends(get_current_user),
) -> CompraDetalleResponse:
    compra = session.get(Compra, compra_id)
    if not compra or compra.usuario_id != usuario.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Compra no encontrada")

    productos = {producto["id"]: producto for producto in cargar_productos()}
    return construir_detalle_compra(compra, session, productos)

# Evento de inicio
@app.on_event("startup")
def on_startup() -> None:
    """Inicializa la base de datos al arrancar la aplicación."""
    create_db_and_tables()
# Ruta raíz
@app.get("/")
def root():
    return {"mensaje": "API de Productos - use /productos para obtener el listado"}
# Listar productos con filtros
@app.get("/productos")
def obtener_productos(categoria: str | None = None, busqueda: str | None = None):
    productos = cargar_productos()

    if categoria:
        categoria_lower = categoria.lower()
        productos = [producto for producto in productos if producto.get("categoria", "").lower() == categoria_lower]

    if busqueda:
        termino = busqueda.lower()
        productos = [
            producto
            for producto in productos
            if termino in producto.get("titulo", "").lower()
            or termino in producto.get("descripcion", "").lower()
        ]

    return productos

# Obtener producto por ID
@app.get("/productos/{producto_id}")
def obtener_producto(producto_id: int):
    productos = cargar_productos()
    for producto in productos:
        if producto.get("id") == producto_id:
            return producto

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
