from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Session, create_engine, select
from typing import Optional
from pydantic import BaseModel
from pathlib import Path
from sqlalchemy import text
import time
import hashlib
import secrets
import json

from models import Usuario, Producto, Carrito, CarritoItem, Compra, CompraItem

# ------------------ CONFIGURACIÓN DE BASE DE DATOS ------------------
BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / "ParcialProgramacion.db"
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False}, echo=False)

def get_session():
    with Session(engine) as s:
        yield s

# ------------------ MODELOS DE DATOS ------------------
# Modelos movidos a models/ para mejor organización

# ------------------ HELPERS Y UTILIDADES ------------------
def _ensure_cart_open(c: Carrito) -> None:
    if c.estado != "abierto":
        raise HTTPException(status_code=400, detail="Carrito finalizado")

def _img_url(img: str | None) -> str | None:
    if not img: return None
    if img.startswith(("http://", "https://", "//")): return img
    if img.startswith("/imagenes/"): return img
    if img.startswith("imagenes/"): return f"/{img}"
    return f"/imagenes/{img}"

def _iva_rate_for(categoria: Optional[str]) -> float:
    c = (categoria or "").lower()
    return 0.10 if "electr" in c else 0.21

def _mask_tarjeta(t: str) -> str:
    d = "".join(ch for ch in t if ch.isdigit())
    return f"**** **** **** {d[-4:]}" if len(d) >= 4 else ""

# ------------------ CONFIGURACIÓN DE LA APP ------------------
app = FastAPI()

# CORS para frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/imagenes", StaticFiles(directory=str(BASE_DIR / "imagenes"), check_dir=False), name="imagenes")

# Middleware de logging
@app.middleware("http")
async def log_requests(request, call_next):
    t0 = time.time()
    try:
        resp = await call_next(request)
        return resp
    finally:
        dt = (time.time() - t0) * 1000
        print(f"[{request.method}] {request.url.path} -> {dt:.1f}ms")

# ------------------ CARGA Y MIGRACIÓN DE PRODUCTOS ------------------
def _ensure_schema():
    with engine.begin() as conn:
        cols = {row[1] for row in conn.execute(text("PRAGMA table_info('compra')")).fetchall()}
        def ensure(table: str, name: str, type_sql: str):
            if name not in cols and table == "compra":
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {type_sql}"))
        ensure("compra", "subtotal", "REAL")
        ensure("compra", "iva_total", "REAL")
        ensure("compra", "envio", "REAL")
        ensure("compra", "tarjeta_mask", "TEXT")
        ensure("compra", "fecha", "TEXT")
        ensure("compra", "nombre", "TEXT")
        ensure("compra", "direccion", "TEXT")
        ensure("compra", "telefono", "TEXT")
        ensure("compra", "metodo_pago", "TEXT")
        ensure("compra", "estado", "TEXT")

    with engine.begin() as conn:
        cols = {row[1] for row in conn.execute(text("PRAGMA table_info('producto')")).fetchall()}
        if "titulo" in cols and "nombre" not in cols:
            conn.execute(text("ALTER TABLE producto RENAME COLUMN titulo TO nombre"))
        def ensure_col(name: str, type_sql: str, default_sql: str | None = None):
            nonlocal cols
            if name not in cols:
                alter = f"ALTER TABLE producto ADD COLUMN {name} {type_sql}"
                if default_sql:
                    alter += f" DEFAULT {default_sql}"
                conn.execute(text(alter))
        ensure_col("nombre", "TEXT")
        ensure_col("descripcion", "TEXT", "''")
        ensure_col("precio", "REAL", "0")
        ensure_col("categoria", "TEXT", "''")
        ensure_col("valoracion", "REAL")
        ensure_col("existencia", "INTEGER", "0")
        ensure_col("imagen", "TEXT")

        if "titulo" in cols:
            conn.execute(text("""
                UPDATE producto
                SET nombre = COALESCE(NULLIF(nombre, ''), NULLIF(titulo, ''))
                WHERE (nombre IS NULL OR nombre = '') AND titulo IS NOT NULL AND titulo <> ''
            """))
        conn.execute(text("""
            UPDATE producto
            SET nombre = 'Producto ' || id
            WHERE nombre IS NULL OR nombre = ''
        """))

def cargar_productos_json(s: Session):
    ruta = BASE_DIR / "productos.json"
    if not ruta.exists():
        return
    if s.exec(select(Producto.id)).first():
        return
    data = json.loads(ruta.read_text(encoding="utf-8"))
    for it in data:
        p = Producto(
            id=it.get("id"),
            nombre=(it.get("titulo") or "").strip(),
            descripcion=it.get("descripcion") or "",
            precio=float(it.get("precio") or 0),
            categoria=it.get("categoria") or "",
            valoracion=it.get("valoracion"),
            existencia=int(it.get("existencia") or 0),
            imagen=it.get("imagen"),
        )
        s.add(p)
    s.commit()

def reparar_nombres_desde_json(s: Session):
    ruta = BASE_DIR / "productos.json"
    if not ruta.exists():
        return
    data = json.loads(ruta.read_text(encoding="utf-8"))
    by_id = {int(item["id"]): item for item in data if "id" in item}
    prods = s.exec(select(Producto)).all()
    changed = 0
    for p in prods:
        src = by_id.get(int(p.id)) if p.id is not None else None
        if not src:
            continue
        new_nombre = (src.get("titulo") or "").strip()
        if new_nombre and new_nombre != (p.nombre or ""):
            p.nombre = new_nombre
            changed += 1
        if (p.descripcion or "") != (src.get("descripcion") or ""):
            p.descripcion = src.get("descripcion") or ""
            changed += 1
        precio_src = float(src.get("precio") or 0)
        if float(p.precio or 0) != precio_src:
            p.precio = precio_src
            changed += 1
        if (p.categoria or "") != (src.get("categoria") or ""):
            p.categoria = src.get("categoria") or ""
            changed += 1
        if p.valoracion != src.get("valoracion"):
            p.valoracion = src.get("valoracion")
            changed += 1
        existencia_src = int(src.get("existencia") or 0)
        if int(p.existencia or 0) != existencia_src:
            p.existencia = existencia_src
            changed += 1
        if (p.imagen or "") != (src.get("imagen") or ""):
            p.imagen = src.get("imagen")
            changed += 1
        s.add(p)
    if changed:
        s.commit()

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)
    _ensure_schema()
    with Session(engine) as s:
        cargar_productos_json(s)
        reparar_nombres_desde_json(s)

# ------------------ AUTENTICACIÓN ------------------
def hash_password(p: str) -> str:
    return hashlib.sha256(p.encode()).hexdigest()

def verify_password(p: str, h: str) -> bool:
    return hash_password(p) == h

active_tokens: dict[str, int] = {}

def current_user_id(authorization: str | None = Header(None)) -> int:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="No autorizado")
    token = authorization.split(" ", 1)[1]
    uid = active_tokens.get(token)
    if not uid:
        raise HTTPException(status_code=401, detail="Token inválido")
    return uid

class RegisterRequest(BaseModel):
    nombre: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class CartAdd(BaseModel):
    producto_id: int
    cantidad: int = 1

class ConfirmCheckoutRequest(BaseModel):
    nombre: str
    direccion: str
    telefono: str
    tarjeta: str
    metodo_pago: Optional[str] = None

@app.post("/registrar", status_code=201)
def registrar(req: RegisterRequest, s: Session = Depends(get_session)):
    if s.exec(select(Usuario).where(Usuario.email == req.email)).first():
        raise HTTPException(400, "Email ya registrado")
    u = Usuario(nombre=req.nombre, email=req.email, password_hash=hash_password(req.password))
    s.add(u); s.commit(); s.refresh(u)
    return {"id": u.id, "email": u.email}

@app.post("/iniciar-sesion")
def login(req: LoginRequest, s: Session = Depends(get_session)):
    u = s.exec(select(Usuario).where(Usuario.email == req.email)).first()
    if not u or not verify_password(req.password, u.password_hash):
        raise HTTPException(401, "Credenciales inválidas")
    token = secrets.token_hex(16)
    active_tokens[token] = u.id
    return {"access_token": token, "token_type": "bearer", "user": {"id": u.id, "nombre": u.nombre}}

@app.post("/cerrar-sesion")
def cerrar_sesion(authorization: str | None = Header(None)):
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]
        active_tokens.pop(token, None)
    return {"ok": True}

# ------------------ ENDPOINTS DE PRODUCTOS ------------------
def _leer_productos_json() -> list[dict]:
    ruta = BASE_DIR / "productos.json"
    if not ruta.exists():
        return []
    try:
        return json.loads(ruta.read_text(encoding="utf-8"))
    except Exception as e:
        print("ERROR leyendo productos.json:", e)
        return []

@app.get("/")
def root():
    return {"message": "API E-Commerce funcionando"}

@app.get("/productos")
def listar_productos(buscar: Optional[str] = None, categoria: Optional[str] = None, s: Session = Depends(get_session)):
    print("DEBUG: /productos")
    try:
        prods = s.exec(select(Producto)).all()
    except Exception as e:
        print("ERROR BD:", e)
        prods = []

    if not prods:
        data = _leer_productos_json()
        if buscar:
            data = [p for p in data if buscar.lower() in (p.get("titulo", "") + p.get("descripcion", "")).lower()]
        if categoria:
            data = [p for p in data if categoria.lower() in p.get("categoria", "").lower()]
        return data

    if buscar:
        prods = [p for p in prods if buscar.lower() in (p.nombre or "" + p.descripcion or "").lower()]
    if categoria:
        prods = [p for p in prods if categoria.lower() in (p.categoria or "").lower()]

    return [{
        "id": p.id,
        "titulo": p.nombre,
        "precio": p.precio,
        "descripcion": p.descripcion,
        "categoria": p.categoria,
        "valoracion": p.valoracion,
        "existencia": p.existencia,
        "imagen": p.imagen,
        "imagen_url": _img_url(p.imagen),
        "agotado": p.existencia <= 0
    } for p in prods]

@app.get("/productos/{producto_id}")
def detalle_producto(producto_id: int, s: Session = Depends(get_session)):
    p = s.get(Producto, producto_id)
    if not p:
        raise HTTPException(404, "Producto no encontrado")
    return {
        "id": p.id,
        "titulo": p.nombre,
        "precio": p.precio,
        "descripcion": p.descripcion,
        "categoria": p.categoria,
        "valoracion": p.valoracion,
        "existencia": p.existencia,
        "imagen": p.imagen,
        "imagen_url": _img_url(p.imagen),
        "agotado": p.existencia <= 0,
    }

# ------------------ ENDPOINTS DE CARRITO ------------------
def get_or_create_cart(s: Session, uid: int) -> Carrito:
    c = s.exec(select(Carrito).where(Carrito.usuario_id == uid, Carrito.estado == "abierto")).first()
    if c: return c
    c = Carrito(usuario_id=uid, estado="abierto")
    s.add(c); s.commit(); s.refresh(c)
    return c

@app.post("/carrito")
def carrito_agregar(body: CartAdd, uid: int = Depends(current_user_id), s: Session = Depends(get_session)):
    p = s.get(Producto, body.producto_id)
    if not p:
        raise HTTPException(404, "Producto no encontrado")
    if p.existencia <= 0:
        raise HTTPException(400, "Producto agotado")
    if body.cantidad > p.existencia:
        raise HTTPException(400, f"Stock insuficiente: solo hay {p.existencia} unidades disponibles")
    c = get_or_create_cart(s, uid); _ensure_cart_open(c)
    it = s.exec(select(CarritoItem).where(CarritoItem.carrito_id == c.id, CarritoItem.producto_id == p.id)).first()
    if it:
        it.cantidad += body.cantidad
    else:
        it = CarritoItem(carrito_id=c.id, producto_id=p.id, cantidad=body.cantidad)
        s.add(it)
    s.commit()
    return {"ok": True}

@app.post("/carrito/restar")
def carrito_restar(body: CartAdd, uid: int = Depends(current_user_id), s: Session = Depends(get_session)):
    c = get_or_create_cart(s, uid)
    _ensure_cart_open(c)
    it = s.exec(select(CarritoItem).where(CarritoItem.carrito_id == c.id, CarritoItem.producto_id == body.producto_id)).first()
    if not it:
        raise HTTPException(404, "Item no encontrado en carrito")
    it.cantidad -= max(1, body.cantidad)
    if it.cantidad <= 0:
        s.delete(it)
    s.commit()
    return {"ok": True}

@app.delete("/carrito/{product_id}")
def carrito_quitar(product_id: int, uid: int = Depends(current_user_id), s: Session = Depends(get_session)):
    c = get_or_create_cart(s, uid); _ensure_cart_open(c)
    it = s.exec(select(CarritoItem).where(CarritoItem.carrito_id == c.id, CarritoItem.producto_id == product_id)).first()
    if not it:
        raise HTTPException(404, "Item no encontrado en carrito")
    s.delete(it); s.commit()
    return {"ok": True}

@app.get("/carrito")
def carrito(uid: int = Depends(current_user_id), s: Session = Depends(get_session)):
    c = get_or_create_cart(s, uid)
    items = s.exec(select(CarritoItem).where(CarritoItem.carrito_id == c.id)).all()
    data = []
    for it in items:
        p = s.get(Producto, it.producto_id)
        if p:
            data.append({
                "producto_id": it.producto_id,
                "titulo": p.nombre,
                "cantidad": it.cantidad,
                "precio": p.precio,
                "subtotal": it.cantidad * p.precio,
                "imagen_url": _img_url(p.imagen)
            })
    return {"carrito_id": c.id, "estado": c.estado, "items": data}

@app.post("/carrito/cancelar")
def carrito_cancelar(uid: int = Depends(current_user_id), s: Session = Depends(get_session)):
    c = get_or_create_cart(s, uid)
    if c.estado != "abierto":
        raise HTTPException(400, "Carrito ya cerrado")
    items = s.exec(select(CarritoItem).where(CarritoItem.carrito_id == c.id)).all()
    for it in items:
        s.delete(it)
    s.commit()
    return {"ok": True}

@app.post("/checkout/confirm", status_code=201)
def checkout_confirm(req: ConfirmCheckoutRequest, uid: int = Depends(current_user_id), s: Session = Depends(get_session)):
    return carrito_finalizar(req, uid, s)

@app.post("/carrito/finalizar", status_code=201)
def carrito_finalizar(req: ConfirmCheckoutRequest, uid: int = Depends(current_user_id), s: Session = Depends(get_session)):
    carrito = get_or_create_cart(s, uid)
    _ensure_cart_open(carrito)

    items = s.exec(select(CarritoItem).where(CarritoItem.carrito_id == carrito.id)).all()
    if not items:
        raise HTTPException(400, "Carrito vacío")

    for it in items:
        p = s.get(Producto, it.producto_id)
        if not p or p.existencia < it.cantidad:
            raise HTTPException(400, f"Stock insuficiente para {p.nombre if p else 'producto'}")

    compra = Compra(
        usuario_id=uid,
        nombre=req.nombre.strip(),
        direccion=req.direccion.strip(),
        telefono=req.telefono.strip(),
        tarjeta_mask=_mask_tarjeta(req.tarjeta),
        metodo_pago="tarjeta",
        estado="confirmada",
        subtotal=0.0, iva_total=0.0, envio=0.0, total=0.0,
    )
    s.add(compra); s.commit(); s.refresh(compra)

    subtotal = 0.0
    iva_total = 0.0
    for it in items:
        p = s.get(Producto, it.producto_id)
        precio_unit = p.precio
        iva_rate = _iva_rate_for(p.categoria)
        item_subtotal = it.cantidad * precio_unit
        item_iva = item_subtotal * iva_rate
        subtotal += item_subtotal
        iva_total += item_iva
        ci = CompraItem(
            compra_id=compra.id,
            producto_id=it.producto_id,
            cantidad=it.cantidad,
            precio_unit=precio_unit,
            subtotal=item_subtotal,
            titulo=p.nombre,
            imagen=p.imagen,
            categoria=p.categoria,
            iva_rate=iva_rate
        )
        s.add(ci)
        p.existencia -= it.cantidad
        s.add(p)

    envio = 0 if (subtotal + iva_total) > 1000 else (50 if items else 0)
    compra.subtotal = subtotal
    compra.iva_total = iva_total
    compra.envio = envio
    compra.total = subtotal + iva_total + envio
    carrito.estado = "cerrado"

    s.add(compra); s.add(carrito); s.commit()
    return {"ok": True, "compra_id": compra.id}

# ------------------ ENDPOINTS DE COMPRAS ------------------
@app.get("/compras")
def compras_usuario(uid: int = Depends(current_user_id), s: Session = Depends(get_session)):
    compras = s.exec(select(Compra).where(Compra.usuario_id == uid).order_by(Compra.id.desc())).all()
    out = []
    for c in compras:
        items_count = s.exec(select(CompraItem).where(CompraItem.compra_id == c.id)).all()
        out.append({
            "id": c.id,
            "fecha_iso": c.fecha.isoformat(),
            "total": c.total,
            "subtotal": c.subtotal,
            "iva_total": c.iva_total,
            "envio": c.envio,
            "items_cantidad": len(items_count),
            "estado": c.estado,
            "metodo_pago": c.metodo_pago
        })
    return out

@app.get("/compras/{compra_id}")
def compra_detalle(compra_id: int, uid: int = Depends(current_user_id), s: Session = Depends(get_session)):
    c = s.get(Compra, compra_id)
    if not c or c.usuario_id != uid:
        raise HTTPException(404, "Compra no encontrada")
    its = s.exec(select(CompraItem).where(CompraItem.compra_id == c.id)).all()
    return {
        "id": c.id,
        "fecha_iso": c.fecha.isoformat(),
        "estado": c.estado,
        "metodo_pago": c.metodo_pago,
        "nombre": c.nombre,
        "direccion": c.direccion,
        "telefono": c.telefono,
        "tarjeta_mask": c.tarjeta_mask,
        "subtotal": c.subtotal,
        "iva_total": c.iva_total,
        "envio": c.envio,
        "total": c.total,
        "items": [{
            "id": it.id,
            "producto_id": it.producto_id,
            "titulo": it.titulo,
            "cantidad": it.cantidad,
            "precio_unit": it.precio_unit,
            "subtotal": it.subtotal,
            "iva": it.subtotal * it.iva_rate,
            "categoria": it.categoria,
            "imagen_url": _img_url(it.imagen)
        } for it in its]
    }

# ------------------ HEALTH CHECK ------------------
@app.get("/health")
def health():
    return {"ok": True}

 # para authgate 
@app.get("/me")
def me(uid: int = Depends(current_user_id), s: Session = Depends(get_session)):
    u = s.get(Usuario, uid)
    return {"user": {"id": u.id, "nombre": u.nombre, "email": u.email}}

