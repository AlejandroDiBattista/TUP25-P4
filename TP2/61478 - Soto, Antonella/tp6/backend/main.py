from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import SQLModel, Field, create_engine, Session, select
from typing import Optional, List
from pathlib import Path
import json
import os
import hashlib
import hmac
import base64
import time

from models.productos import Producto
from fastapi.responses import FileResponse

DATABASE_URL = os.environ.get("TP6_DATABASE_URL", "sqlite:///./tp6.db")
SECRET = os.environ.get("TP6_SECRET", "dev-secret-please-change")
TOKEN_EXP_SECONDS = int(os.environ.get("TP6_TOKEN_EXP", 60 * 60 * 24))

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

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


# ----- Modelos adicionales (se usan sin crear archivos nuevos) -----
class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: str = Field(index=True, unique=True)
    hashed_password: str


class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: str = Field(default="abierto")


class ItemCarrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id")
    producto_id: int
    cantidad: int = Field(default=1, ge=1)


class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha: float = Field(default_factory=time.time)
    direccion: Optional[str]
    tarjeta: Optional[str]
    total: float = 0.0
    envio: float = 0.0


class ItemCompra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int
    cantidad: int
    nombre: str
    precio_unitario: float


class TokenBlacklist(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    token: str
    expires_at: int

# -- Request/response schemas para documentación y validación --
class UsuarioCreate(SQLModel):
    nombre: str
    email: str
    password: str

class LoginRequest(SQLModel):
    email: str
    password: str


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed


def make_token(email: str) -> str:
    exp = int(time.time()) + TOKEN_EXP_SECONDS
    msg = f"{email}:{exp}".encode("utf-8")
    sig = hmac.new(SECRET.encode("utf-8"), msg, hashlib.sha256).digest()
    token = base64.urlsafe_b64encode(msg + b"." + sig).decode("utf-8")
    return token


def verify_token(token: str) -> Optional[str]:
    try:
        data = base64.urlsafe_b64decode(token.encode("utf-8"))
        parts = data.split(b".")
        if len(parts) != 2:
            return None
        msg, sig = parts
        expected = hmac.new(SECRET.encode("utf-8"), msg, hashlib.sha256).digest()
        if not hmac.compare_digest(sig, expected):
            return None
        email_exp = msg.decode("utf-8")
        email, exp_s = email_exp.split(":")
        if int(exp_s) < int(time.time()):
            return None
        return email
    except Exception:
        return None


def get_session():
    with Session(engine) as session:
        yield session


@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)
    # seed productos.json if Producto table empty
    with Session(engine) as session:
        existe = session.exec(select(Producto)).first()
        if not existe:
            ruta = Path(__file__).parent / "productos.json"
            if ruta.exists():
                with open(ruta, "r", encoding="utf-8") as f:
                    datos = json.load(f)
                for p in datos:
                    prod = Producto(
                        nombre=p.get("titulo") or p.get("nombre") or "",
                        descripcion=p.get("descripcion", ""),
                        precio=float(p.get("precio", 0.0)),
                        categoria=p.get("categoria", ""),
                        existencia=int(p.get("existencia", 0)),
                    )
                    session.add(prod)
                session.commit()


# ----- Dependencia para obtener usuario actual -----
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme), session: Session = Depends(get_session)):
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing credentials")
    token = credentials.credentials
    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    # check blacklist
    black = session.exec(select(TokenBlacklist).where(TokenBlacklist.token == token)).first()
    if black:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalidated")
    user = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    # attach raw token on user for logout if needed
    setattr(user, "_token_raw", token)
    return user


# ----- Endpoints -----
@app.get("/")
def root():
    return {"mensaje": "API TP6 - comercio simple"}


@app.post("/registrar")
def registrar(payload: UsuarioCreate, session: Session = Depends(get_session)):
    nombre = payload.nombre
    email = payload.email
    password = payload.password
    if not nombre or not email or not password:
        raise HTTPException(status_code=400, detail="nombre, email y password requeridos")
    exists = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    user = Usuario(nombre=nombre, email=email, hashed_password=hash_password(password))
    session.add(user)
    session.commit()
    return {"ok": True}


@app.post("/iniciar-sesion")
def iniciar_sesion(payload: LoginRequest, session: Session = Depends(get_session)):
    email = payload.email
    password = payload.password
    if not email or not password:
        raise HTTPException(status_code=400, detail="email y password requeridos")
    user = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = make_token(email)
    return {"access_token": token, "token_type": "bearer"}


@app.post("/cerrar-sesion")
def cerrar_sesion(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme), session: Session = Depends(get_session)):
    # invalidar token guardándolo en la blacklist
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing credentials")
    token = credentials.credentials
    # extraer exp para guardar
    try:
        data = base64.urlsafe_b64decode(token.encode("utf-8"))
        msg = data.split(b".")[0]
        _, exp_s = msg.decode("utf-8").split(":")
        exp = int(exp_s)
    except Exception:
        exp = int(time.time())
    black = TokenBlacklist(token=token, expires_at=exp)
    session.add(black)
    session.commit()
    return {"ok": True}


@app.get("/productos")
def listar_productos(q: Optional[str] = None, categoria: Optional[str] = None, session: Session = Depends(get_session)):
    query = select(Producto)
    prods = session.exec(query).all()
    resultados = []
    for p in prods:
        if q and q.lower() not in (p.nombre or "").lower() and q.lower() not in (p.descripcion or "").lower():
            continue
        if categoria and categoria.lower() not in (p.categoria or "").lower():
            continue
        item = {
            "id": p.id,
            "nombre": p.nombre,
            "descripcion": p.descripcion,
            "precio": p.precio,
            "categoria": p.categoria,
            "existencia": p.existencia,
            "imagen": f"imagenes/{p.id:04d}.png",
            "estado": "Agotado" if (p.existencia or 0) <= 0 else "Disponible",
        }
        resultados.append(item)
    return resultados


@app.get("/productos/{product_id}")
def obtener_producto(product_id: int, session: Session = Depends(get_session)):
    p = session.get(Producto, product_id)
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {
        "id": p.id,
        "nombre": p.nombre,
        "descripcion": p.descripcion,
        "precio": p.precio,
        "categoria": p.categoria,
        "existencia": p.existencia,
        "imagen": f"imagenes/{p.id:04d}.png",
        "estado": "Agotado" if (p.existencia or 0) <= 0 else "Disponible",
    }


def obtener_carrito_abierto(usuario_id: int, session: Session) -> Carrito:
    c = session.exec(select(Carrito).where(Carrito.usuario_id == usuario_id, Carrito.estado == "abierto")).first()
    if c:
        return c
    c = Carrito(usuario_id=usuario_id)
    session.add(c)
    session.commit()
    session.refresh(c)
    return c


@app.post("/carrito")
def agregar_al_carrito(item: dict, user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    product_id = int(item.get("product_id"))
    cantidad = int(item.get("cantidad", 1))
    prod = session.get(Producto, product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if prod.existencia < cantidad:
        raise HTTPException(status_code=400, detail="No hay suficiente stock")
    if cantidad <= 0:
        raise HTTPException(status_code=400, detail="Cantidad inválida")
    carrito = obtener_carrito_abierto(user.id, session)
    existing = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == product_id)).first()
    if existing:
        if prod.existencia < cantidad:
            raise HTTPException(status_code=400, detail="No hay suficiente stock")
        existing.cantidad += cantidad
        session.add(existing)
    else:
        ic = ItemCarrito(carrito_id=carrito.id, producto_id=product_id, cantidad=cantidad)
        session.add(ic)
    
    # Descontar del stock
    prod.existencia -= cantidad
    session.add(prod)
    session.commit()
    return {"ok": True}


@app.delete("/carrito/{product_id}")
def quitar_producto_carrito(product_id: int, user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == user.id, Carrito.estado == "abierto")).first()
    if not carrito:
        raise HTTPException(status_code=404, detail="Carrito no encontrado")
    item = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == product_id)).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado en el carrito")
    
    # Restaurar el stock
    prod = session.get(Producto, product_id)
    if prod:
        prod.existencia += item.cantidad
        session.add(prod)
    
    session.delete(item)
    session.commit()
    return {"ok": True}


@app.get("/carrito")
def ver_carrito(user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == user.id, Carrito.estado == "abierto")).first()
    if not carrito:
        return {"items": []}
    items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all()
    detalle = []
    subtotal = 0.0
    for it in items:
        prod = session.get(Producto, it.producto_id)
        producto_dict = {
            "id": prod.id,
            "nombre": prod.nombre,
            "descripcion": prod.descripcion,
            "precio": prod.precio,
            "categoria": prod.categoria,
            "existencia": prod.existencia,
            "imagen": f"imagenes/{prod.id:04d}.png",
        }
        detalle.append({"producto": producto_dict, "cantidad": it.cantidad})
        subtotal += prod.precio * it.cantidad
    return {"items": detalle, "subtotal": subtotal}


def tasa_iva_por_categoria(cat: Optional[str]) -> float:
    # Consigna: IVA 21% por defecto, 10% para productos electrónicos
    if not cat:
        return 0.21
    if "electr" in cat.lower():
        return 0.10
    return 0.21


@app.post("/carrito/finalizar")
def finalizar_carrito(payload: dict, user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    direccion = payload.get("direccion")
    tarjeta = payload.get("tarjeta")
    if not direccion or not tarjeta:
        raise HTTPException(status_code=400, detail="direccion y tarjeta requeridos")
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == user.id, Carrito.estado == "abierto")).first()
    if not carrito:
        raise HTTPException(status_code=404, detail="Carrito no encontrado")
    items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all()
    if not items:
        raise HTTPException(status_code=400, detail="Carrito vacío")
    subtotal = 0.0
    detalles_compra = []
    for it in items:
        prod = session.get(Producto, it.producto_id)
        if it.cantidad > prod.existencia:
            raise HTTPException(status_code=400, detail=f"Sin stock suficiente para {prod.nombre}")
        subtotal += prod.precio * it.cantidad
        detalles_compra.append((prod, it.cantidad))

    # Consigna: envío gratuito para compras superiores a $1000, sino costo fijo $50
    ENVIO_GRATIS_UMBRAL = 1000.0
    COSTO_ENVIO = 50.0
    envio = 0.0 if subtotal > ENVIO_GRATIS_UMBRAL else COSTO_ENVIO

    iva_total = 0.0
    for prod, cant in detalles_compra:
        iva_total += prod.precio * cant * tasa_iva_por_categoria(prod.categoria)
    total = subtotal + iva_total + envio

    compra = Compra(usuario_id=user.id, direccion=direccion, tarjeta=tarjeta, total=total, envio=envio)
    session.add(compra)
    session.commit()
    session.refresh(compra)
    for prod, cant in detalles_compra:
        ic = ItemCompra(compra_id=compra.id, producto_id=prod.id, cantidad=cant, nombre=prod.nombre, precio_unitario=prod.precio)
        session.add(ic)
        prod.existencia = max(0, prod.existencia - cant)
        session.add(prod)
    carrito.estado = "finalizado"
    session.add(carrito)
    for it in items:
        session.delete(it)
    session.commit()
    return {"ok": True, "compra_id": compra.id, "total": total}


@app.post("/carrito/cancelar")
def cancelar_carrito(user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == user.id, Carrito.estado == "abierto")).first()
    if not carrito:
        raise HTTPException(status_code=404, detail="Carrito no encontrado")
    # borrar items
    items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all()
    for it in items:
        session.delete(it)
    carrito.estado = "cancelado"
    session.add(carrito)
    session.commit()
    return {"ok": True}


@app.get("/compras")
def ver_compras(user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    compras = session.exec(select(Compra).where(Compra.usuario_id == user.id)).all()
    return compras


@app.get("/compras/{compra_id}")
def detalle_compra(compra_id: int, user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    compra = session.get(Compra, compra_id)
    if not compra or compra.usuario_id != user.id:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    items = session.exec(select(ItemCompra).where(ItemCompra.compra_id == compra.id)).all()
    return {"compra": compra, "items": items}


@app.get("/favicon.ico")
def favicon():
    path = Path(__file__).parent / "imagenes" / "favicon.ico"
    if path.exists():
        return FileResponse(path)
    raise HTTPException(status_code=404, detail="favicon not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
