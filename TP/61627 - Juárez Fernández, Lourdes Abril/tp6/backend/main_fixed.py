"""Backend TP6 - Versión compatible con Python 3.14"""

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

DATABASE_URL = "sqlite:///./tp6.db"
SECRET = "dev-secret-please-change"
TOKEN_EXP_SECONDS = 60 * 60 * 24

ENVIO_GRATIS_UMBRAL = 1000.0
COSTO_ENVIO_FIJO = 50.0

engine = create_engine(DATABASE_URL, echo=False)

def get_session():
    with Session(engine) as session:
        yield session

class Producto(SQLModel, table=True):
    __tablename__ = "producto"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(default="", max_length=255)
    descripcion: str = Field(default="")
    precio: float = Field(default=0.0, ge=0)
    categoria: str = Field(default="", max_length=100)
    existencia: int = Field(default=0, ge=0) 
    imagen: str = Field(default="")

class Usuario(SQLModel, table=True):
    __tablename__ = "usuario"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: str = Field(index=True, unique=True)
    hashed_password: str

class Carrito(SQLModel, table=True):
    __tablename__ = "carrito"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: str = Field(default="abierto")

class ItemCarrito(SQLModel, table=True):
    __tablename__ = "itemcarrito"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id")
    producto_id: int
    cantidad: int = Field(default=1, ge=1)

class Compra(SQLModel, table=True):
    __tablename__ = "compra"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha: float = Field(default_factory=time.time)
    direccion: Optional[str]
    tarjeta: Optional[str]
    total: float = 0.0
    envio: float = 0.0

class ItemCompra(SQLModel, table=True):
    __tablename__ = "itemcompra"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int
    cantidad: int
    nombre: str
    precio_unitario: float

class TokenBlacklist(SQLModel, table=True):
    __tablename__ = "tokenblacklist"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    token: str
    expires_at: int

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed_password: str) -> bool:
    return hash_password(password) == hashed_password

def create_token(email: str) -> str:
    timestamp = int(time.time())
    data = f"{email}:{timestamp}:{SECRET}"
    token = base64.b64encode(data.encode()).decode()
    return token

def verify_token(token: str) -> Optional[str]:
    try:
        data = base64.b64decode(token).decode()
        email, timestamp, secret = data.split(":", 2)
        if secret != SECRET:
            return None
        if int(timestamp) + TOKEN_EXP_SECONDS < time.time():
            return None
        return email
    except:
        return None

def obtener_carrito_abierto(usuario_id: int, session: Session) -> Carrito:
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == usuario_id, Carrito.estado == "abierto")).first()
    if not carrito:
        carrito = Carrito(usuario_id=usuario_id, estado="abierto")
        session.add(carrito)
        session.commit()
        session.refresh(carrito)
    return carrito

def mascara_tarjeta(t: Optional[str]) -> Optional[str]:
    if not t or len(t) < 4:
        return None
    return "**** **** **** " + t[-4:]

app = FastAPI(title="TP6 E-commerce API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    app.mount("/images", StaticFiles(directory="images"), name="images")
except Exception:
    pass

def get_current_user(request: Request, session: Session = Depends(get_session)):
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid authorization header")
    
    token = auth_header[7:]  # Remove "Bearer "
    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    
    blacklisted = session.exec(select(TokenBlacklist).where(TokenBlacklist.token == token)).first()
    if blacklisted:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token blacklisted")
    
    user = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    return user

@app.get("/")
def root():
    return {"message": "TP6 E-commerce API funcionando correctamente"}

@app.post("/registrar")
def register_user(user_data: dict, session: Session = Depends(get_session)):
    nombre = user_data.get("nombre")
    email = user_data.get("email")
    password = user_data.get("password")
    
    if not all([nombre, email, password]):
        raise HTTPException(status_code=400, detail="Nombre, email y contraseña son requeridos")
    
    existing_user = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    hashed_pwd = hash_password(password)
    new_user = Usuario(nombre=nombre, email=email, hashed_password=hashed_pwd)
    session.add(new_user)
    session.commit()
    
    token = create_token(email)
    return {"access_token": token, "token_type": "bearer"}

@app.post("/iniciar-sesion")
def login_user(user_data: dict, session: Session = Depends(get_session)):
    email = user_data.get("email")
    password = user_data.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email y contraseña son requeridos")
    
    user = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    token = create_token(email)
    return {"access_token": token, "token_type": "bearer"}

@app.post("/cerrar-sesion")
def logout_user(request: Request, session: Session = Depends(get_session)):
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
        blacklist_entry = TokenBlacklist(token=token, expires_at=int(time.time()) + TOKEN_EXP_SECONDS)
        session.add(blacklist_entry)
        session.commit()
    
    return {"message": "Sesión cerrada correctamente"}

@app.get("/productos")
def get_products(session: Session = Depends(get_session)):
    productos = session.exec(select(Producto)).all()
    return productos

@app.get("/carrito")
def get_cart(user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    carrito = obtener_carrito_abierto(user.id, session)
    items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all()
    
    result = []
    total = 0
    for item in items:
        product = session.get(Producto, item.producto_id)
        if product:
            subtotal = product.precio * item.cantidad
            total += subtotal
            result.append({
                "id": item.id,
                "producto_id": product.id,
                "nombre": product.nombre,
                "precio": product.precio,
                "cantidad": item.cantidad,
                "subtotal": subtotal,
                "imagen": product.imagen
            })
    
    return {"items": result, "total": total}

@app.post("/carrito")
def add_to_cart(item_data: dict, user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    product_id = int(item_data.get("product_id"))
    cantidad = int(item_data.get("cantidad", 1))
    
    product = session.get(Producto, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    if product.existencia <= 0:
        raise HTTPException(status_code=400, detail="Producto agotado")
    
    if cantidad <= 0:
        raise HTTPException(status_code=400, detail="Cantidad debe ser mayor a 0")
    
    carrito = obtener_carrito_abierto(user.id, session)
    
    existing_item = session.exec(select(ItemCarrito).where(
        ItemCarrito.carrito_id == carrito.id,
        ItemCarrito.producto_id == product_id
    )).first()
    
    if existing_item:
        new_quantity = existing_item.cantidad + cantidad
        if new_quantity > product.existencia:
            raise HTTPException(status_code=400, detail="No hay suficiente stock")
        existing_item.cantidad = new_quantity
        session.add(existing_item)
    else:
        if cantidad > product.existencia:
            raise HTTPException(status_code=400, detail="No hay suficiente stock")
        new_item = ItemCarrito(carrito_id=carrito.id, producto_id=product_id, cantidad=cantidad)
        session.add(new_item)
    
    session.commit()
    return {"ok": True}

@app.delete("/carrito/{product_id}")
def remove_from_cart(product_id: int, user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == user.id, Carrito.estado == "abierto")).first()
    if not carrito:
        raise HTTPException(status_code=404, detail="Carrito no encontrado")
    
    item = session.exec(select(ItemCarrito).where(
        ItemCarrito.carrito_id == carrito.id,
        ItemCarrito.producto_id == product_id
    )).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado en el carrito")
    
    session.delete(item)
    session.commit()
    return {"ok": True}

@app.put("/carrito/{product_id}")
def update_cart_quantity(product_id: int, data: dict, user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    nueva_cantidad = int(data.get("cantidad", 1))
    if nueva_cantidad <= 0:
        raise HTTPException(status_code=400, detail="La cantidad debe ser mayor a 0")
    
    carrito = obtener_carrito_abierto(user.id, session)
    item = session.exec(select(ItemCarrito).where(
        ItemCarrito.carrito_id == carrito.id,
        ItemCarrito.producto_id == product_id
    )).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado en el carrito")
    
    product = session.get(Producto, product_id)
    if nueva_cantidad > product.existencia:
        raise HTTPException(status_code=400, detail="No hay suficiente stock")
    
    item.cantidad = nueva_cantidad
    session.add(item)
    session.commit()
    return {"ok": True}

@app.post("/comprar")
def process_purchase(purchase_data: dict, user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    direccion = purchase_data.get("direccion")
    tarjeta = purchase_data.get("tarjeta")
    
    if not direccion or not tarjeta:
        raise HTTPException(status_code=400, detail="Dirección y tarjeta son requeridas")
    
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == user.id, Carrito.estado == "abierto")).first()
    if not carrito:
        raise HTTPException(status_code=400, detail="No hay carrito activo")
    
    items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all()
    if not items:
        raise HTTPException(status_code=400, detail="El carrito está vacío")
    
    total = 0
    for item in items:
        product = session.get(Producto, item.producto_id)
        if not product:
            raise HTTPException(status_code=400, detail=f"Producto {item.producto_id} no encontrado")
        if item.cantidad > product.existencia:
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para {product.nombre}")
        total += product.precio * item.cantidad
    
    envio = 0.0 if total >= ENVIO_GRATIS_UMBRAL else COSTO_ENVIO_FIJO
    
    compra = Compra(
        usuario_id=user.id,
        direccion=direccion,
        tarjeta=tarjeta,
        total=total,
        envio=envio
    )
    session.add(compra)
    session.commit()
    session.refresh(compra)
    
    for item in items:
        product = session.get(Producto, item.producto_id)
        
        purchase_item = ItemCompra(
            compra_id=compra.id,
            producto_id=item.producto_id,
            cantidad=item.cantidad,
            nombre=product.nombre,
            precio_unitario=product.precio
        )
        session.add(purchase_item)
        
        product.existencia -= item.cantidad
        session.add(product)
    
    carrito.estado = "comprado"
    session.add(carrito)
    
    session.commit()
    return {"compra_id": compra.id, "total": total + envio}

@app.get("/compras")
def get_purchases(user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    compras = session.exec(select(Compra).where(Compra.usuario_id == user.id)).all()
    result = []
    
    for compra in compras:
        items = session.exec(select(ItemCompra).where(ItemCompra.compra_id == compra.id)).all()
        from datetime import datetime
        result.append({
            "id": compra.id,
            "fecha": datetime.fromtimestamp(compra.fecha).strftime("%Y-%m-%d %H:%M"),
            "direccion": compra.direccion,
            "tarjeta": mascara_tarjeta(compra.tarjeta),
            "total": compra.total,
            "envio": compra.envio,
            "items": [
                {
                    "producto_id": item.producto_id,
                    "nombre": item.nombre,
                    "precio_unitario": item.precio_unitario,
                    "cantidad": item.cantidad,
                    "subtotal": item.precio_unitario * item.cantidad
                }
                for item in items
            ]
        })
    
    return result

def init_database():
    """Inicializa la base de datos y carga productos si es necesario"""
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        existing_products = session.exec(select(Producto)).first()
        if not existing_products:
            productos_json = Path(__file__).parent / "productos.json"
            if productos_json.exists():
                with open(productos_json, "r", encoding="utf-8") as f:
                    products_data = json.load(f)
                
                for product_data in products_data:
                    imagen_path = product_data.get("imagen", "")
                    if "/" in imagen_path:
                        imagen_path = imagen_path.split("/")[-1]
                    
                    product = Producto(
                        id=product_data.get("id"),
                        nombre=product_data.get("titulo") or product_data.get("nombre", ""),
                        descripcion=product_data.get("descripcion", ""),
                        precio=float(product_data.get("precio", 0)),
                        categoria=product_data.get("categoria", ""),
                        existencia=int(product_data.get("existencia", 5)),
                        imagen=imagen_path
                    )
                    session.add(product)
                
                session.commit()
                print(f"✅ {len(products_data)} productos cargados correctamente")

init_database()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)