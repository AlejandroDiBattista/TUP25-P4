"""Backend simplificado para TP6 - Todos los modelos en un archivo"""

import time
import json
import hashlib
from pathlib import Path
from typing import Optional
import jwt
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from sqlmodel import SQLModel, Field, Session, create_engine, select

SECRET_KEY = "mi-clave-secreta-jwt-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

engine = create_engine("sqlite:///database.db", echo=False)

def get_session():
    with Session(engine) as session:
        yield session

class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(default="", max_length=255)
    descripcion: str = Field(default="")
    precio: float = Field(default=0.0, ge=0)
    categoria: str = Field(default="", max_length=100)
    existencia: int = Field(default=0, ge=0) 
    imagen: str = Field(default="")

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

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed_password: str) -> bool:
    return hash_password(password) == hashed_password

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        return email
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def obtener_carrito_abierto(usuario_id: int, session: Session) -> Carrito:
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == usuario_id, Carrito.estado == "abierto")).first()
    if not carrito:
        carrito = Carrito(usuario_id=usuario_id, estado="abierto")
        session.add(carrito)
        session.commit()
        session.refresh(carrito)
    return carrito

def calcular_iva(precio: float, categoria: str) -> float:
    if "electrón" in categoria.lower() or "tecnología" in categoria.lower():
        return precio * 0.10
    return precio * 0.21

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

bearer_scheme = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme), session: Session = Depends(get_session)):
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing credentials")
    token = credentials.credentials
    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    blacklisted = session.exec(select(TokenBlacklist).where(TokenBlacklist.token == token)).first()
    if blacklisted:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token blacklisted")
    
    return user

@app.get("/")
def root():
    return {"message": "TP6 E-commerce API funcionando"}

@app.post("/register")
def register(user_data: dict, session: Session = Depends(get_session)):
    nombre = user_data.get("nombre")
    email = user_data.get("email")
    password = user_data.get("password")
    
    if not all([nombre, email, password]):
        raise HTTPException(status_code=400, detail="Faltan campos requeridos")
    
    existing = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    
    hashed_pwd = hash_password(password)
    new_user = Usuario(nombre=nombre, email=email, hashed_password=hashed_pwd)
    session.add(new_user)
    session.commit()
    
    token = create_access_token(data={"sub": email})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/login")
def login(user_data: dict, session: Session = Depends(get_session)):
    email = user_data.get("email")
    password = user_data.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email y contraseña requeridos")
    
    user = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    token = create_access_token(data={"sub": email})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/logout")
def logout(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme), session: Session = Depends(get_session)):
    if credentials:
        token = credentials.credentials
        blacklist_entry = TokenBlacklist(token=token, expires_at=int(time.time()) + ACCESS_TOKEN_EXPIRE_HOURS * 3600)
        session.add(blacklist_entry)
        session.commit()
    return {"message": "Logged out"}

@app.get("/productos")
def get_productos(session: Session = Depends(get_session)):
    productos = session.exec(select(Producto)).all()
    return productos

@app.get("/carrito")
def get_carrito(user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    carrito = obtener_carrito_abierto(user.id, session)
    items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all()
    
    result = []
    total = 0
    for item in items:
        prod = session.get(Producto, item.producto_id)
        if prod:
            subtotal = prod.precio * item.cantidad
            total += subtotal
            result.append({
                "id": item.id,
                "producto_id": prod.id,
                "nombre": prod.nombre,
                "precio": prod.precio,
                "cantidad": item.cantidad,
                "subtotal": subtotal,
                "imagen": prod.imagen
            })
    
    return {"items": result, "total": total}

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
    carrito = obtener_carrito_abierto(user.id, session)
    existing = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == product_id)).first()
    if existing:
        if existing.cantidad + cantidad > prod.existencia:
            raise HTTPException(status_code=400, detail="No hay suficiente stock")
        existing.cantidad += cantidad
        session.add(existing)
    else:
        if cantidad > prod.existencia:
            raise HTTPException(status_code=400, detail="No hay suficiente stock")
        ic = ItemCarrito(carrito_id=carrito.id, producto_id=product_id, cantidad=cantidad)
        session.add(ic)
    session.commit()
    return {"ok": True}

@app.delete("/carrito/{product_id}")
def quitar_producto_carrito(product_id: int, user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == user.id, Carrito.estado == "abierto")).first()
    if not carrito:
        raise HTTPException(status_code=404, detail="Carrito no encontrado")
    item = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == product_id)).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    session.delete(item)
    session.commit()
    return {"ok": True}

@app.put("/carrito/{product_id}")
def actualizar_cantidad_carrito(product_id: int, data: dict, user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    nueva_cantidad = int(data.get("cantidad", 1))
    if nueva_cantidad <= 0:
        raise HTTPException(status_code=400, detail="Cantidad inválida")
    
    carrito = obtener_carrito_abierto(user.id, session)
    item = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == product_id)).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    prod = session.get(Producto, product_id)
    if nueva_cantidad > prod.existencia:
        raise HTTPException(status_code=400, detail="No hay suficiente stock")
    
    item.cantidad = nueva_cantidad
    session.add(item)
    session.commit()
    return {"ok": True}

@app.post("/comprar")
def procesar_compra(compra_data: dict, user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    direccion = compra_data.get("direccion")
    tarjeta = compra_data.get("tarjeta")
    
    if not direccion or not tarjeta:
        raise HTTPException(status_code=400, detail="Dirección y tarjeta requeridas")
    
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == user.id, Carrito.estado == "abierto")).first()
    if not carrito:
        raise HTTPException(status_code=400, detail="Carrito vacío")
    
    items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all()
    if not items:
        raise HTTPException(status_code=400, detail="Carrito vacío")
    
    total = 0
    for item in items:
        prod = session.get(Producto, item.producto_id)
        if not prod:
            raise HTTPException(status_code=400, detail=f"Producto {item.producto_id} no encontrado")
        if item.cantidad > prod.existencia:
            raise HTTPException(status_code=400, detail=f"Sin stock suficiente para {prod.nombre}")
        total += prod.precio * item.cantidad
    
    envio = 50.0 if total < 1000 else 0.0
    
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
        prod = session.get(Producto, item.producto_id)
        item_compra = ItemCompra(
            compra_id=compra.id,
            producto_id=item.producto_id,
            cantidad=item.cantidad,
            nombre=prod.nombre,
            precio_unitario=prod.precio
        )
        session.add(item_compra)
        
        prod.existencia -= item.cantidad
        session.add(prod)
    
    carrito.estado = "comprado"
    session.add(carrito)
    
    session.commit()
    return {"compra_id": compra.id, "total": total + envio}

@app.get("/compras")
def get_historial_compras(user: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    compras = session.exec(select(Compra).where(Compra.usuario_id == user.id)).all()
    result = []
    for compra in compras:
        items = session.exec(select(ItemCompra).where(ItemCompra.compra_id == compra.id)).all()
        result.append({
            "id": compra.id,
            "fecha": datetime.fromtimestamp(compra.fecha).strftime("%Y-%m-%d %H:%M"),
            "direccion": compra.direccion,
            "tarjeta": mascara_tarjeta(compra.tarjeta),
            "total": compra.total,
            "envio": compra.envio,
            "items": [
                {
                    "producto_id": it.producto_id,
                    "nombre": it.nombre,
                    "precio_unitario": it.precio_unitario,
                    "cantidad": it.cantidad,
                    "subtotal": it.precio_unitario * it.cantidad
                }
                for it in items
            ],
        })
    return result

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        count = session.exec(select(Producto)).first()
        if not count:
            productos_json_path = Path(__file__).parent / "productos.json"
            if productos_json_path.exists():
                try:
                    with open(productos_json_path, "r", encoding="utf-8") as f:
                        datos_productos = json.load(f)
                    
                    for datos in datos_productos:
                        nombre = datos.get("titulo") or datos.get("nombre", "")
                        imagen_path = datos.get("imagen", "")
                        if "/" in imagen_path:
                            imagen_path = imagen_path.split("/")[-1]
                        
                        producto = Producto(
                            id=datos.get("id"),
                            nombre=nombre,
                            descripcion=datos.get("descripcion", ""),
                            precio=float(datos.get("precio", 0)),
                            categoria=datos.get("categoria", ""),
                            existencia=int(datos.get("existencia", 5)),
                            imagen=imagen_path
                        )
                        session.add(producto)
                    session.commit()
                    print(f"✅ Productos cargados desde {productos_json_path}")
                except Exception as e:
                    print(f"❌ Error cargando productos: {e}")
            else:
                print(f"⚠️  No se encontró {productos_json_path}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)