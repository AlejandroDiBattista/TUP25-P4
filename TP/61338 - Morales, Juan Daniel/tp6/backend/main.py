from __future__ import annotations
from pathlib import Path
from typing import Optional, Dict, List

from fastapi import FastAPI, HTTPException, Depends, Form, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import SQLModel, create_engine, Session, select
from passlib.hash import bcrypt
import secrets
import unicodedata

# ── DB y modelos ──────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
DB_URL = f"sqlite:///{BASE_DIR / 'db.sqlite3'}"
engine = create_engine(DB_URL, echo=False)

from models import (
    Usuario, Producto, Carrito, ItemCarrito, Compra, ItemCompra
)
from models.productos import seed_productos

# ── App y middlewares ─────────────────────────────────────────────────────────
app = FastAPI(title="API Productos")

app.mount("/imagenes", StaticFiles(directory=BASE_DIR / "imagenes"), name="imagenes")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Hooks de arranque ─────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as s:
        seed_productos(s, BASE_DIR)

# ── Helpers ───────────────────────────────────────────────────────────────────
def get_session():
    with Session(engine) as session:
        yield session

def auth_user(
    authorization: Optional[str] = Header(default=None),
    session: Session = Depends(get_session),
) -> int:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Token requerido")
    token = authorization.replace("Bearer ", "").strip()
    u = session.exec(select(Usuario).where(Usuario.token == token)).first()
    if not u:
        raise HTTPException(401, "Token inválido")
    return u.id

def _normalize(s: str) -> str:
    s_nfkd = unicodedata.normalize("NFD", s or "")
    return "".join(c for c in s_nfkd if unicodedata.category(c) != "Mn").lower().strip()

def calcular_iva(item: ItemCarrito, producto: Producto) -> float:
    cat = _normalize(producto.categoria)
    tasa = 0.10 if cat.startswith("electro") else 0.21
    return item.cantidad * float(producto.precio) * tasa

def costo_envio(subtotal_con_iva: float) -> float:
    return 0.0 if subtotal_con_iva > 1000 else 50.0

def get_or_create_carrito(session: Session, usuario_id: int) -> Carrito:
    carrito = session.exec(
        select(Carrito).where(Carrito.usuario_id == usuario_id, Carrito.estado == "abierto")
    ).first()
    if not carrito:
        carrito = Carrito(usuario_id=usuario_id, estado="abierto")
        session.add(carrito)
        session.commit()
        session.refresh(carrito)
    return carrito

# ── Rutas básicas ─────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"mensaje": "API de Productos - use /productos, /carrito y /compras"}

# ── Auth ──────────────────────────────────────────────────────────────────────
@app.post("/registrar")
def registrar(
    nombre: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    session: Session = Depends(get_session),
):
    try:
        ya = session.exec(select(Usuario).where(Usuario.email == email)).first()
        if ya:
            raise HTTPException(400, "Email ya registrado")
        hashed = bcrypt.hash(password[:72])
        u = Usuario(nombre=nombre, email=email, password_hash=hashed)
        session.add(u)
        session.commit()
        return {"ok": True, "msg": "registrado"}
    except Exception as e:
        raise HTTPException(500, f"Error al registrar usuario: {e}")

@app.post("/iniciar-sesion")
def iniciar_sesion(
    email: str = Form(...),
    password: str = Form(...),
    session: Session = Depends(get_session),
):
    u = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if not u or not bcrypt.verify(password, u.password_hash):
        raise HTTPException(401, "Credenciales inválidas")
    token = secrets.token_urlsafe(24)
    u.token = token
    session.add(u)
    session.commit()
    session.refresh(u)
    return {"token": token, "usuario": {"id": u.id, "nombre": u.nombre, "email": u.email}}

@app.post("/cerrar-sesion")
def cerrar_sesion(
    authorization: Optional[str] = Header(default=None),
    session: Session = Depends(get_session),
):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        u = session.exec(select(Usuario).where(Usuario.token == token)).first()
        if u:
            u.token = None
            session.add(u)
            session.commit()
    return {"ok": True}

# ── Productos ─────────────────────────────────────────────────────────────────
@app.get("/productos")
def listar_productos(
    q: Optional[str] = Query(default=None),
    categoria: Optional[str] = Query(default=None),
    session: Session = Depends(get_session),
):
    prods = session.exec(select(Producto)).all()
    if q:
        ql = _normalize(q)
        prods = [p for p in prods if ql in _normalize(p.nombre) or ql in _normalize(p.descripcion)]
    if categoria:
        cat = _normalize(categoria)
        prods = [p for p in prods if _normalize(p.categoria) == cat]
    return prods

@app.get("/productos/{pid}")
def detalle_producto(pid: int, session: Session = Depends(get_session)):
    p = session.get(Producto, pid)
    if not p:
        raise HTTPException(404, "Producto no encontrado")
    return p

# ── Carrito ───────────────────────────────────────────────────────────────────
@app.get("/carrito")
def ver_carrito(user_id: int = Depends(auth_user), session: Session = Depends(get_session)):
    carrito = get_or_create_carrito(session, user_id)
    items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all()
    detalle: List[dict] = []
    subtotal = 0.0
    iva_total = 0.0
    for it in items:
        prod = session.get(Producto, it.producto_id)
        if not prod:
            continue
        linea_sub = float(prod.precio) * it.cantidad
        detalle.append({
            "producto_id": prod.id,
            "nombre": prod.nombre,
            "cantidad": it.cantidad,
            "precio_unitario": float(prod.precio),
            "subtotal": linea_sub,
            "imagen": f"http://localhost:8000/{prod.imagen}" if prod.imagen else None,
        })
        subtotal += linea_sub
        iva_total += calcular_iva(it, prod)
    total_parcial = subtotal + iva_total
    envio = costo_envio(total_parcial)
    total = total_parcial + envio
    return {
        "carrito_id": carrito.id,
        "estado": carrito.estado,
        "items": detalle,
        "subtotal": round(subtotal, 2),
        "iva": round(iva_total, 2),
        "envio": round(envio, 2),
        "total": round(total, 2),
    }

@app.post("/carrito")
def agregar_carrito(
    producto_id: int = Form(...),
    cantidad: int = Form(ge=1, default=1),
    user_id: int = Depends(auth_user),
    session: Session = Depends(get_session),
):
    prod = session.get(Producto, producto_id)
    if not prod:
        raise HTTPException(404, "Producto no encontrado")
    if prod.existencia < cantidad:
        raise HTTPException(400, "Producto sin stock suficiente")
    carrito = get_or_create_carrito(session, user_id)
    if carrito.estado != "abierto":
        raise HTTPException(400, "El carrito no está abierto")
    item = session.exec(
        select(ItemCarrito).where(
            ItemCarrito.carrito_id == carrito.id,
            ItemCarrito.producto_id == producto_id
        )
    ).first()
    if item:
        nuevo = item.cantidad + cantidad
        if prod.existencia < nuevo:
            raise HTTPException(400, "No hay existencia suficiente")
        item.cantidad = nuevo
    else:
        item = ItemCarrito(carrito_id=carrito.id, producto_id=producto_id, cantidad=cantidad)
        session.add(item)
    session.commit()
    return {"ok": True}

@app.delete("/carrito/{producto_id}")
def quitar_carrito(
    producto_id: int,
    user_id: int = Depends(auth_user),
    session: Session = Depends(get_session),
):
    carrito = get_or_create_carrito(session, user_id)
    if carrito.estado != "abierto":
        raise HTTPException(400, "No se pueden quitar productos de un carrito no abierto")
    item = session.exec(
        select(ItemCarrito).where(
            ItemCarrito.carrito_id == carrito.id,
            ItemCarrito.producto_id == producto_id
        )
    ).first()
    if not item:
        raise HTTPException(404, "Item no está en el carrito")
    session.delete(item)
    session.commit()
    return {"ok": True}

@app.post("/carrito/cancelar")
def cancelar_carrito(user_id: int = Depends(auth_user), session: Session = Depends(get_session)):
    carrito = get_or_create_carrito(session, user_id)
    carrito.estado = "cancelado"
    for it in session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all():
        session.delete(it)
    session.commit()
    return {"ok": True}

@app.post("/carrito/finalizar")
def finalizar_compra(
    direccion: str = Form(...),
    tarjeta: str = Form(...),
    user_id: int = Depends(auth_user),
    session: Session = Depends(get_session),
):
    carrito = get_or_create_carrito(session, user_id)
    if carrito.estado != "abierto":
        raise HTTPException(400, "Carrito no abierto")
    items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all()
    if not items:
        raise HTTPException(400, "El carrito está vacío")
    subtotal = 0.0
    iva_total = 0.0
    detalle_items: List[ItemCompra] = []
    for it in items:
        prod = session.get(Producto, it.producto_id)
        if not prod or prod.existencia < it.cantidad:
            raise HTTPException(400, f"Sin stock para {prod.nombre if prod else it.producto_id}")
        linea = float(prod.precio) * it.cantidad
        subtotal += linea
        iva_total += calcular_iva(it, prod)
        detalle_items.append(ItemCompra(
            producto_id=prod.id,
            cantidad=it.cantidad,
            nombre=prod.nombre,
            precio_unitario=float(prod.precio),
        ))
    total_parcial = subtotal + iva_total
    envio = costo_envio(total_parcial)
    total = total_parcial + envio
    compra = Compra(
        usuario_id=user_id,
        direccion=direccion,
        tarjeta=f"****{tarjeta[-4:]}",
        total=round(total, 2),
        envio=round(envio, 2),
    )
    session.add(compra)
    session.commit()
    session.refresh(compra)
    for di in detalle_items:
        di.compra_id = compra.id
        session.add(di)
    for it in items:
        prod = session.get(Producto, it.producto_id)
        prod.existencia -= it.cantidad
        session.delete(it)
    carrito.estado = "finalizado"
    session.commit()
    return {"ok": True, "compra_id": compra.id, "total": compra.total, "envio": compra.envio}

# ── Compras ───────────────────────────────────────────────────────────────────
@app.get("/compras")
def compras_usuario(user_id: int = Depends(auth_user), session: Session = Depends(get_session)):
    compras = session.exec(select(Compra).where(Compra.usuario_id == user_id)).all()
    return [
        {
            "id": c.id,
            "fecha": c.fecha.isoformat(),
            "direccion": c.direccion,
            "total": c.total,
            "envio": c.envio,
        }
        for c in compras
    ]

@app.get("/compras/{cid}")
def detalle_compra(cid: int, user_id: int = Depends(auth_user), session: Session = Depends(get_session)):
    c = session.get(Compra, cid)
    if not c or c.usuario_id != user_id:
        raise HTTPException(404, "Compra no encontrada")
    items = session.exec(select(ItemCompra).where(ItemCompra.compra_id == cid)).all()
    return {
        "id": c.id,
        "fecha": c.fecha.isoformat(),
        "direccion": c.direccion,
        "tarjeta": c.tarjeta,  
        "total": c.total,
        "envio": c.envio,
        "items": [
            {
                "producto_id": it.producto_id,
                "nombre": it.nombre,
                "cantidad": it.cantidad,
                "precio_unitario": it.precio_unitario,
            } for it in items
        ]
    }
