from __future__ import annotations

from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import SQLModel, Field, create_engine, Session, select
from sqlalchemy import text
from typing import Optional, List
from pathlib import Path
import json
import os
import hashlib
import hmac
import base64
import time


class Producto(SQLModel, table=True):
    __tablename__: str = "producto"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(default="", max_length=255)
    descripcion: str = Field(default="")
    precio: float = Field(default=0.0, ge=0)
    categoria: str = Field(default="", max_length=100)
    existencia: int = Field(default=0, ge=0)
    imagen: str = Field(default="")

DATABASE_URL = os.environ.get("TP6_DATABASE_URL", "sqlite:///./tp6.db")
SECRET = os.environ.get("TP6_SECRET", "dev-secret-please-change")
TOKEN_EXP_SECONDS = int(os.environ.get("TP6_TOKEN_EXP", 60 * 60 * 24))
ENVIO_UMBRAL = float(os.environ.get("TP6_ENVIO_UMBRAL", 1000.0))
ENVIO_COSTO = float(os.environ.get("TP6_ENVIO_COSTO", 50.0))

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

app = FastAPI(title="API Productos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")


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


def mascara_tarjeta(t: Optional[str]) -> Optional[str]:
    """Devuelve la tarjeta enmascarada mostrando solo los últimos 4 dígitos.
    Ej: **** **** **** 1234. Si no hay dígitos suficientes, devuelve None o cadena vacía.
    """
    if not t:
        return None
    digits = "".join(ch for ch in t if ch.isdigit())
    if len(digits) < 4:
        return None
    last4 = digits[-4:]
    return f"**** **** **** {last4}"


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed


def make_token(email: str) -> str:
    exp = int(time.time()) + TOKEN_EXP_SECONDS
    msg = f"{email}:{exp}".encode("utf-8")
    sig = hmac.new(SECRET.encode("utf-8"), msg, hashlib.sha256).digest()
    token = base64.urlsafe_b64encode(msg + b"|" + sig).decode("utf-8")
    return token


def verify_token(token: str) -> Optional[str]:
    try:
        data = base64.urlsafe_b64decode(token.encode("utf-8"))
        parts = data.split(b"|")
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
    try:
        with engine.begin() as conn:
            cols = [r[1] for r in conn.execute(text("PRAGMA table_info('producto')")).all()]
            if 'imagen' not in cols:
                conn.execute(text("ALTER TABLE producto ADD COLUMN imagen TEXT DEFAULT ''"))
    except Exception:
        pass
    with Session(engine) as session:
        existe = session.exec(select(Producto)).first()
        if not existe:
            ruta = Path(__file__).parent / "productos.json"
            if ruta.exists():
                with open(ruta, "r", encoding="utf-8") as f:
                    datos = json.load(f)
                for p in datos:
                    imagen_path = p.get("imagen", "")
                    if "/" in imagen_path:
                        imagen_path = imagen_path.split("/")[-1]
                    
                    prod = Producto(
                        nombre=p.get("titulo") or p.get("nombre") or "",
                        descripcion=p.get("descripcion", ""),
                        precio=float(p.get("precio", 0.0)),
                        categoria=p.get("categoria", ""),
                        existencia=int(p.get("existencia", 0)),
                        imagen=imagen_path,
                    )
                    session.add(prod)
                session.commit()
            ruta_sync = Path(__file__).parent / "productos.json"
            if ruta_sync.exists():
                try:
                    with open(ruta_sync, "r", encoding="utf-8") as f:
                        datos_sync = json.load(f)
                    by_id = {int(d.get("id")): d for d in datos_sync if d.get("id") is not None}
                    by_name = {(d.get("titulo") or d.get("nombre") or ""): d for d in datos_sync}
                    updated = False
                    productos_db = session.exec(select(Producto)).all()
                    for dbp in productos_db:
                        img = getattr(dbp, "imagen", None)
                        if not img:
                            m = by_id.get(dbp.id) if dbp.id is not None else None
                            if not m:
                                m = by_name.get(dbp.nombre or "")
                            if m and m.get("imagen"):
                                imagen_path = m.get("imagen", "")
                                if "/" in imagen_path:
                                    imagen_path = imagen_path.split("/")[-1]
                                dbp.imagen = imagen_path
                                session.add(dbp)
                                updated = True
                    if updated:
                        session.commit()
                except Exception:
                    pass


from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme), session: Session = Depends(get_session)):
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing credentials")
    token = credentials.credentials
    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    black = session.exec(select(TokenBlacklist).where(TokenBlacklist.token == token)).first()
    if black:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalidated")
    user = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    setattr(user, "_token_raw", token)
    return user


@app.get("/")
def root():
    return {"mensaje": "API TP6 - comercio simple"}


@app.post("/registrar")
def registrar(payload: dict, session: Session = Depends(get_session)):
    nombre = payload.get("nombre")
    email = payload.get("email")
    password = payload.get("password")
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
def iniciar_sesion(payload: dict, session: Session = Depends(get_session)):
    email = payload.get("email")
    password = payload.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="email y password requeridos")
    user = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = make_token(email)
    return {"access_token": token, "token_type": "bearer", "nombre": user.nombre}


@app.post("/cerrar-sesion")
def cerrar_sesion(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme), session: Session = Depends(get_session)):
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing credentials")
    token = credentials.credentials
    try:
        data = base64.urlsafe_b64decode(token.encode("utf-8"))
        parts = data.split(b"|")
        if len(parts) == 2:
            msg, _ = parts
            _, exp_s = msg.decode("utf-8").split(":")
            exp = int(exp_s)
        else:
            exp = int(time.time())
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
            "imagen": getattr(p, "imagen", ""),
            "existencia": p.existencia,
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
        "imagen": getattr(p, "imagen", ""),
        "existencia": p.existencia,
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
    if prod.existencia <= 0:
        raise HTTPException(status_code=400, detail="Producto agotado")
    if cantidad <= 0:
        raise HTTPException(status_code=400, detail="Cantidad inválida")
    if cantidad > prod.existencia:
        raise HTTPException(status_code=400, detail="No hay suficiente stock")
        
    carrito = obtener_carrito_abierto(user.id, session)
    existing = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == product_id)).first()
    
    if existing:
        nueva_cantidad_total = existing.cantidad + cantidad
        if nueva_cantidad_total > prod.existencia + existing.cantidad:
            raise HTTPException(status_code=400, detail="No hay suficiente stock")
        existing.cantidad = nueva_cantidad_total
        session.add(existing)
    else:
        ic = ItemCarrito(carrito_id=carrito.id, producto_id=product_id, cantidad=cantidad)
        session.add(ic)
    
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
    
    prod = session.get(Producto, product_id)
    if prod:
        prod.existencia += item.cantidad
        session.add(prod)
    
    session.delete(item)
    session.commit()
    return {"ok": True}


@app.put("/carrito/{product_id}")
def actualizar_cantidad_carrito(product_id: int, data: dict, user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    nueva_cantidad = int(data.get("cantidad", 1))
    if nueva_cantidad <= 0:
        raise HTTPException(status_code=400, detail="La cantidad debe ser mayor a 0")
    
    carrito = obtener_carrito_abierto(user.id, session)
    item = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == product_id)).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado en el carrito")
    
    prod = session.get(Producto, product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    cantidad_anterior = item.cantidad
    diferencia = nueva_cantidad - cantidad_anterior
    
    if diferencia > 0:
        if diferencia > prod.existencia:
            raise HTTPException(status_code=400, detail=f"No hay suficiente stock. Disponible: {prod.existencia}, solicitado: {diferencia}")
        prod.existencia -= diferencia
    elif diferencia < 0:
        prod.existencia += abs(diferencia)
    
    item.cantidad = nueva_cantidad
    session.add(item)
    session.add(prod)
    session.commit()
    
    return {"ok": True}


@app.get("/carrito")
def ver_carrito(user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == user.id, Carrito.estado == "abierto")).first()
    if not carrito:
        return {"items": [], "subtotal": 0.0, "iva": 0.0, "envio": 0.0, "total": 0.0}
    items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all()
    detalle = []
    subtotal = 0.0
    iva_total = 0.0
    for it in items:
        prod = session.get(Producto, it.producto_id)
        detalle.append({"producto": prod, "cantidad": it.cantidad})
        subtotal += prod.precio * it.cantidad
        iva_total += prod.precio * it.cantidad * tasa_iva_por_categoria(prod.categoria)
    envio = 0.0 if subtotal > ENVIO_UMBRAL else ENVIO_COSTO
    total = subtotal + iva_total + envio
    return {"items": detalle, "subtotal": subtotal, "iva": iva_total, "envio": envio, "total": total}


def tasa_iva_por_categoria(cat: Optional[str]) -> float:
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
        subtotal += prod.precio * it.cantidad
        detalles_compra.append((prod, it.cantidad))

    envio = 0.0 if subtotal > ENVIO_UMBRAL else ENVIO_COSTO
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
    
    items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all()
    for it in items:
        prod = session.get(Producto, it.producto_id)
        if prod:
            prod.existencia += it.cantidad
            session.add(prod)
        session.delete(it)
    
    carrito.estado = "cancelado"
    session.add(carrito)
    session.commit()
    return {"ok": True}


@app.get("/compras")
def ver_compras(user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    compras = session.exec(select(Compra).where(Compra.usuario_id == user.id)).all()
    return [
        {
            "id": c.id,
            "fecha": c.fecha,
            "total": c.total,
            "envio": c.envio,
            "direccion": c.direccion,
            "tarjeta": mascara_tarjeta(c.tarjeta),
        }
        for c in compras
    ]


@app.get("/compras/{compra_id}")
def detalle_compra(compra_id: int, user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    compra = session.get(Compra, compra_id)
    if not compra or compra.usuario_id != user.id:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    items = session.exec(select(ItemCompra).where(ItemCompra.compra_id == compra.id)).all()
    return {
        "id": compra.id,
        "fecha": compra.fecha,
        "total": compra.total,
        "envio": compra.envio,
        "direccion": compra.direccion,
        "tarjeta": mascara_tarjeta(compra.tarjeta),
        "items": [
            {
                "producto_id": it.producto_id,
                "cantidad": it.cantidad,
                "nombre": it.nombre,
                "precio_unitario": it.precio_unitario,
            }
            for it in items
        ],
    }


@app.post("/reset-stock")
def reset_stock(session: Session = Depends(get_session)):
    import json
    from pathlib import Path
    
    try:
        productos_json_path = Path(__file__).parent / "productos.json"
        with open(productos_json_path, "r", encoding="utf-8") as f:
            datos_productos = json.load(f)
        
        productos_actualizados = 0
        productos_json_por_id = {p["id"]: p for p in datos_productos}
        
        productos_db = session.exec(select(Producto)).all()
        for producto_db in productos_db:
            if producto_db.id in productos_json_por_id:
                producto_json = productos_json_por_id[producto_db.id]
                stock_original = producto_json.get("existencia", 5)
                
                if producto_db.existencia != stock_original:
                    producto_db.existencia = stock_original
                    session.add(producto_db)
                    productos_actualizados += 1
        
        session.commit()
        return {
            "message": f"Stock reiniciado para {productos_actualizados} productos",
            "productos_actualizados": productos_actualizados
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al reiniciar stock: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)