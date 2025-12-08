from fastapi import FastAPI, HTTPException, Depends, status, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import SQLModel, create_engine, Session, select
from typing import List
import json
import os
import hashlib
import jwt
from datetime import datetime, timedelta
from models.productos import Producto
from models.usuarios import Usuario, UsuarioCreate, UsuarioLogin, UsuarioResponse
from models.compras import Compra, DetalleCompra, CompraResponse, CompraDetalleResponse

# Configuración
DATABASE_URL = "sqlite:///./tp6.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
app = FastAPI(title="TP6 Shop API")
security = HTTPBearer()

# Clave secreta para JWT (en producción debería estar en variables de entorno)
SECRET_KEY = "mi_clave_secreta_super_segura"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear carpeta de imágenes si no existe
os.makedirs("imagenes", exist_ok=True)
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

def get_session():
    with Session(engine) as session:
        yield session

def hash_password(password: str) -> str:
    """Hash de la contraseña usando SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar contraseña"""
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict):
    """Crear token JWT"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), session: Session = Depends(get_session)):
    """Obtener usuario actual desde el token JWT"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    user = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user

def cargar_productos_desde_json():
    """Carga productos desde productos.json"""
    with Session(engine) as session:
        # SIEMPRE recargar productos
        for producto in session.exec(select(Producto)).all():
            session.delete(producto)
        session.commit()
        
        try:
            print("📁 Cargando productos desde JSON...")
            
            with open('productos.json', 'r', encoding='utf-8') as f:
                productos_data = json.load(f)
            
            print(f"📦 Encontrados {len(productos_data)} productos")
            
            for i, producto_data in enumerate(productos_data, 1):
                titulo = producto_data.get('titulo', f'Producto {i}')
                precio = producto_data.get('precio', 0)
                
                print(f"  ✅ Producto {i}: {titulo} - ${precio}")
                
                producto = Producto(
                    nombre=titulo,
                    descripcion=producto_data.get('descripcion', ''),
                    precio=float(precio),
                    categoria=producto_data.get('categoria', ''),
                    existencia=int(producto_data.get('existencia', 5)),
                    imagen=f"/{producto_data.get('imagen', '')}"
                )
                session.add(producto)
            
            session.commit()
            print(f"✅ {len(productos_data)} productos cargados exitosamente")
            
        except Exception as e:
            print(f"❌ Error: {e}")

@app.on_event("startup")
def startup_event():
    SQLModel.metadata.create_all(engine)
    cargar_productos_desde_json()
    print("🚀 Servidor iniciado correctamente")

# === ENDPOINTS DE AUTENTICACIÓN ===

@app.post("/registrar", response_model=dict)
def registrar_usuario(usuario_data: UsuarioCreate, session: Session = Depends(get_session)):
    """Registrar nuevo usuario"""
    # Verificar si el email ya existe
    existing_user = session.exec(select(Usuario).where(Usuario.email == usuario_data.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Crear nuevo usuario
    hashed_password = hash_password(usuario_data.password)
    nuevo_usuario = Usuario(
        nombre=usuario_data.nombre,
        email=usuario_data.email,
        password_hash=hashed_password
    )
    
    session.add(nuevo_usuario)
    session.commit()
    session.refresh(nuevo_usuario)
    
    # Crear token
    access_token = create_access_token(data={"sub": nuevo_usuario.email})
    
    return {
        "message": "Usuario registrado exitosamente",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": nuevo_usuario.id,
            "nombre": nuevo_usuario.nombre,
            "email": nuevo_usuario.email
        }
    }

@app.post("/iniciar-sesion", response_model=dict)
def iniciar_sesion(login_data: UsuarioLogin, session: Session = Depends(get_session)):
    """Iniciar sesión"""
    # Buscar usuario
    usuario = session.exec(select(Usuario).where(Usuario.email == login_data.email)).first()
    if not usuario or not verify_password(login_data.password, usuario.password_hash):
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
    
    # Crear token
    access_token = create_access_token(data={"sub": usuario.email})
    
    return {
        "message": "Inicio de sesión exitoso",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email
        }
    }

@app.get("/perfil", response_model=UsuarioResponse)
def obtener_perfil(current_user: Usuario = Depends(get_current_user)):
    """Obtener perfil del usuario actual"""
    return current_user

# === ENDPOINTS DE CARRITO ===

@app.post("/agregar-carrito")
def agregar_al_carrito(
    producto_id: int = Form(...),
    cantidad: int = Form(1),
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Agregar producto al carrito y actualizar stock"""
    print(f"🛒 Agregando producto {producto_id} al carrito, cantidad: {cantidad}")
    
    producto = session.get(Producto, producto_id)
    if not producto:
        print(f"❌ Producto {producto_id} no encontrado")
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    print(f"📦 Producto encontrado: {producto.nombre}, stock actual: {producto.existencia}")
    
    if producto.existencia < cantidad:
        print(f"❌ Stock insuficiente. Disponible: {producto.existencia}, solicitado: {cantidad}")
        raise HTTPException(status_code=400, detail=f"Stock insuficiente. Disponible: {producto.existencia}")
    
    # Reducir stock temporalmente (reserva)
    producto.existencia -= cantidad
    session.add(producto)
    session.commit()
    
    print(f"✅ Stock actualizado. Nuevo stock: {producto.existencia}")
    
    return {"message": "Producto agregado al carrito", "stock_restante": producto.existencia}

@app.post("/aumentar-cantidad-carrito")
def aumentar_cantidad_carrito(
    producto_id: int = Form(...),
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Aumentar cantidad en carrito (reducir stock)"""
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    if producto.existencia < 1:
        raise HTTPException(status_code=400, detail="Stock insuficiente")
    
    # Reducir stock
    producto.existencia -= 1
    session.add(producto)
    session.commit()
    
    return {"message": "Cantidad aumentada", "stock_restante": producto.existencia}

@app.post("/disminuir-cantidad-carrito")
def disminuir_cantidad_carrito(
    producto_id: int = Form(...),
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Disminuir cantidad en carrito (aumentar stock)"""
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Aumentar stock
    producto.existencia += 1
    session.add(producto)
    session.commit()
    
    return {"message": "Cantidad disminuida", "stock_restante": producto.existencia}

@app.post("/remover-producto-carrito")
def remover_producto_carrito(
    producto_id: int = Form(...),
    cantidad: int = Form(...),
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Remover producto completamente del carrito (restaurar todo el stock)"""
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Restaurar stock
    producto.existencia += cantidad
    session.add(producto)
    session.commit()
    
    return {"message": "Producto removido del carrito", "stock_restante": producto.existencia}

@app.post("/cancelar-compra")
def cancelar_compra(
    carrito_productos: List[dict],  # [{id: 1, cantidad: 2}, {id: 3, cantidad: 1}]
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Cancelar compra - restaurar stock"""
    for item in carrito_productos:
        producto = session.get(Producto, item["id"])
        if producto:
            producto.existencia += item["cantidad"]
            session.add(producto)
    
    session.commit()
    return {"message": "Compra cancelada, stock restaurado"}

# === ENDPOINTS DE COMPRAS ===

@app.post("/finalizar-compra")
async def finalizar_compra(
    direccion: str = Form(...),
    tarjeta: str = Form(...),
    productos_carrito: str = Form(...),  # JSON string
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Finalizar compra y guardar en historial"""
    import json
    
    try:
        productos_data = json.loads(productos_carrito)
    except:
        raise HTTPException(status_code=400, detail="Datos de productos inválidos")
    
    # Calcular totales
    subtotal = sum(p['precio'] * p['cantidad'] for p in productos_data)
    
    # IVA diferenciado: 21% general, 10% electrónicos
    iva = 0.0
    for p in productos_data:
        categoria = p.get('categoria', '').lower()
        if 'electro' in categoria or 'electronico' in categoria:
            iva += p['precio'] * p['cantidad'] * 0.10  # 10% para electrónicos
        else:
            iva += p['precio'] * p['cantidad'] * 0.21  # 21% para otros productos
    
    # Envío gratuito para compras mayores a $1000
    envio = 0.0 if subtotal >= 1000 else 50.0
    total = subtotal + iva + envio
    
    # Crear compra
    nueva_compra = Compra(
        usuario_id=current_user.id,
        direccion=direccion,
        tarjeta=tarjeta[-4:] + "****",  # Solo últimos 4 dígitos
        subtotal=subtotal,
        iva=iva,
        envio=envio,
        total=total
    )
    
    session.add(nueva_compra)
    session.commit()
    session.refresh(nueva_compra)
    
    # Crear detalles de compra
    for producto in productos_data:
        detalle = DetalleCompra(
            compra_id=nueva_compra.id,
            producto_nombre=producto['nombre'],
            producto_precio=producto['precio'],
            cantidad=producto['cantidad']
        )
        session.add(detalle)
    
    session.commit()
    
    return {"message": "Compra finalizada exitosamente", "compra_id": nueva_compra.id}

@app.get("/mis-compras")
def obtener_mis_compras(
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Obtener historial de compras del usuario"""
    compras = session.exec(
        select(Compra).where(Compra.usuario_id == current_user.id).order_by(Compra.fecha.desc())
    ).all()
    
    resultado = []
    for compra in compras:
        # Obtener productos de la compra
        detalles = session.exec(
            select(DetalleCompra).where(DetalleCompra.compra_id == compra.id)
        ).all()
        
        productos = [
            {
                "nombre": detalle.producto_nombre,
                "precio": detalle.producto_precio,
                "cantidad": detalle.cantidad
            }
            for detalle in detalles
        ]
        
        resultado.append({
            "id": compra.id,
            "fecha": compra.fecha.isoformat(),
            "total": compra.total,
            "direccion": compra.direccion,
            "productos": productos
        })
    
    return resultado

@app.get("/compra/{compra_id}")
def obtener_detalle_compra(
    compra_id: int,
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Obtener detalle de una compra específica"""
    compra = session.exec(
        select(Compra).where(
            Compra.id == compra_id,
            Compra.usuario_id == current_user.id
        )
    ).first()
    
    if not compra:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    
    # Obtener productos de la compra
    detalles = session.exec(
        select(DetalleCompra).where(DetalleCompra.compra_id == compra.id)
    ).all()
    
    productos = [
        {
            "nombre": detalle.producto_nombre,
            "precio": detalle.producto_precio,
            "cantidad": detalle.cantidad
        }
        for detalle in detalles
    ]
    
    return {
        "id": compra.id,
        "fecha": compra.fecha.isoformat(),
        "direccion": compra.direccion,
        "tarjeta": compra.tarjeta,
        "subtotal": compra.subtotal,
        "iva": compra.iva,
        "envio": compra.envio,
        "total": compra.total,
        "productos": productos
    }

@app.get("/productos/{producto_id}/stock")
def obtener_stock(producto_id: int, session: Session = Depends(get_session)):
    """Obtener stock actual de un producto"""
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"stock": producto.existencia}

# === ENDPOINTS DE PRODUCTOS ===

@app.get("/")
def root():
    return {"mensaje": "TP6 Shop API funcionando"}

@app.get("/productos", response_model=List[Producto])
def listar_productos(session: Session = Depends(get_session)):
    productos = session.exec(select(Producto)).all()
    return productos

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)