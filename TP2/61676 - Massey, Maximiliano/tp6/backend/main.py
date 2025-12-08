from fastapi import FastAPI, Depends, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, SQLModel, create_engine, select
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
import json
from pathlib import Path
import bcrypt

from models.usuarios import Usuario
from models.carrito import ItemCarrito
from models.compras import Compra, CompraItem
from models.productos import Producto

# Esquemas Pydantic
class UsuarioRegistro(BaseModel):
    nombre: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class AgregarCarritoRequest(BaseModel):
    cantidad: int = 1

# Configuración de la base de datos
DATABASE_URL = "sqlite:///./tienda.db"
engine = create_engine(DATABASE_URL, echo=False)

# Configuración de JWT (simplificada)
SECRET_KEY = "clave_secreta_super_segura_cambiar_en_produccion_123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Crear aplicación
app = FastAPI(title="TP6 Shop API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear tablas y cargar datos iniciales
@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)
    
    # Cargar productos desde JSON si la tabla está vacía
    with Session(engine) as session:
        # Verificar si ya hay productos
        productos_existentes = session.exec(select(Producto)).first()
        if not productos_existentes:
            # Cargar productos desde JSON
            productos_data = cargar_productos()
            for prod_data in productos_data:
                producto = Producto(
                    id=prod_data.get("id"),
                    nombre=prod_data.get("nombre") or prod_data.get("titulo", ""),
                    titulo=prod_data.get("titulo") or prod_data.get("nombre", ""),
                    descripcion=prod_data.get("descripcion", ""),
                    precio=prod_data.get("precio", 0.0),
                    categoria=prod_data.get("categoria", ""),
                    existencia=prod_data.get("existencia", 0),
                    imagen=prod_data.get("imagen", ""),
                    valoracion=prod_data.get("valoracion", 0.0)
                )
                session.add(producto)
            session.commit()
            print(f"✓ {len(productos_data)} productos cargados en la base de datos")

# Montar imágenes
try:
    app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")
except:
    pass

# Dependencias
def get_db():
    with Session(engine) as session:
        yield session

# Funciones auxiliares para passwords usando bcrypt directamente
def hash_password(password: str) -> str:
    """Hash de password usando bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar password"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# Función para crear token JWT (simplificada sin jose)
def create_access_token(email: str) -> str:
    """Crear token simple (en producción usar JWT real)"""
    import base64
    token_data = f"{email}:{SECRET_KEY}:{datetime.utcnow().isoformat()}"
    return base64.b64encode(token_data.encode()).decode()

def verify_token(token: str) -> Optional[str]:
    """Verificar token y retornar email"""
    try:
        import base64
        decoded = base64.b64decode(token.encode()).decode()
        parts = decoded.split(':')
        if len(parts) >= 2 and parts[1] == SECRET_KEY:
            return parts[0]  # email
    except:
        pass
    return None

# Obtener usuario actual
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    email = verify_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    usuario = db.exec(select(Usuario).where(Usuario.email == email)).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return usuario

def cargar_productos():
    try:
        ruta = Path(__file__).parent / "productos.json"
        with open(ruta, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return []

# RUTAS

@app.get("/")
def root():
    return {"message": "TP6 Shop API - Funcionando correctamente"}

@app.get("/productos")
async def obtener_productos(search: str = None, categoria: str = None, db: Session = Depends(get_db)):
    """Obtener lista de productos desde la base de datos con filtros opcionales"""
    query = select(Producto)
    
    # Aplicar filtro de búsqueda
    if search:
        search = search.lower()
        query = query.where(
            (Producto.nombre.contains(search)) | 
            (Producto.titulo.contains(search)) | 
            (Producto.descripcion.contains(search))
        )
    
    # Aplicar filtro de categoría
    if categoria:
        query = query.where(Producto.categoria == categoria)
    
    productos = db.exec(query).all()
    
    # Convertir a diccionarios para la respuesta
    return [
        {
            "id": p.id,
            "nombre": p.nombre,
            "titulo": p.titulo,
            "descripcion": p.descripcion,
            "precio": p.precio,
            "categoria": p.categoria,
            "existencia": p.existencia,
            "imagen": p.imagen,
            "valoracion": p.valoracion
        }
        for p in productos
    ]

@app.get("/productos/{producto_id}")
async def obtener_producto(producto_id: int, db: Session = Depends(get_db)):
    """Obtener detalles de un producto específico"""
    producto = db.exec(select(Producto).where(Producto.id == producto_id)).first()
    
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    return {
        "id": producto.id,
        "nombre": producto.nombre,
        "titulo": producto.titulo,
        "descripcion": producto.descripcion,
        "precio": producto.precio,
        "categoria": producto.categoria,
        "existencia": producto.existencia,
        "imagen": producto.imagen,
        "valoracion": producto.valoracion
    }

@app.post("/registrar")
async def registrar_usuario(usuario_data: UsuarioRegistro, db: Session = Depends(get_db)):
    """Registrar nuevo usuario"""
    # Verificar si el email ya existe
    usuario_existente = db.exec(select(Usuario).where(Usuario.email == usuario_data.email)).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Crear nuevo usuario
    usuario_nuevo = Usuario(
        nombre=usuario_data.nombre,
        email=usuario_data.email,
        password_hash=hash_password(usuario_data.password)
    )
    
    db.add(usuario_nuevo)
    db.commit()
    db.refresh(usuario_nuevo)
    
    return {"mensaje": "Usuario registrado exitosamente", "usuario": {"id": usuario_nuevo.id, "nombre": usuario_nuevo.nombre, "email": usuario_nuevo.email}}

@app.post("/token")
async def iniciar_sesion(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Iniciar sesión"""
    usuario = db.exec(select(Usuario).where(Usuario.email == form_data.username)).first()
    
    if not usuario or not verify_password(form_data.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(usuario.email)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email
        }
    }

@app.get("/carrito")
async def obtener_carrito(current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.exec(select(ItemCarrito).where(ItemCarrito.usuario_id == current_user.id)).all()
    
    resultado = []
    
    for item in items:
        # Obtener producto de la base de datos
        producto = db.exec(select(Producto).where(Producto.id == item.producto_id)).first()
        if producto:
            resultado.append({
                "id": item.producto_id,
                "producto_id": item.producto_id,
                "cantidad": item.cantidad,
                "nombre": producto.nombre,
                "titulo": producto.titulo,
                "precio": producto.precio,
                "imagen": producto.imagen,
                "categoria": producto.categoria,
                "descripcion": producto.descripcion,
                "existencia": producto.existencia,
                "valoracion": producto.valoracion
            })
    
    return resultado

@app.post("/carrito/agregar/{producto_id}")
async def agregar_al_carrito(
    producto_id: int,
    request: AgregarCarritoRequest,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cantidad = request.cantidad
    
    # Verificar que el producto existe en la DB
    producto = db.exec(select(Producto).where(Producto.id == producto_id)).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Verificar si ya está en el carrito
    item_existente = db.exec(
        select(ItemCarrito).where(
            ItemCarrito.usuario_id == current_user.id,
            ItemCarrito.producto_id == producto_id
        )
    ).first()
    
    if item_existente:
        # Actualizar cantidad
        nueva_cantidad_total = item_existente.cantidad + cantidad
        
        # Verificar stock
        if nueva_cantidad_total > producto.existencia:
            stock_disponible = producto.existencia - item_existente.cantidad
            if stock_disponible <= 0:
                raise HTTPException(
                    status_code=400, 
                    detail="No hay más stock disponible. Ya tienes el máximo en el carrito."
                )
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente. Solo puedes agregar {stock_disponible} unidades más (tienes {item_existente.cantidad} en el carrito, stock total: {producto.existencia})"
            )
        
        item_existente.cantidad = nueva_cantidad_total
        db.commit()
        db.refresh(item_existente)
        
        return {
            "mensaje": "Cantidad actualizada en el carrito",
            "producto_id": producto_id,
            "cantidad_total": item_existente.cantidad,
            "stock_disponible": producto.existencia,
            "stock_restante": producto.existencia - item_existente.cantidad
        }
    else:
        # Verificar stock antes de crear nuevo item
        if cantidad > producto.existencia:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente. Solo hay {producto.existencia} unidades disponibles"
            )
        
        # Crear nuevo item en carrito
        nuevo_item = ItemCarrito(
            usuario_id=current_user.id,
            producto_id=producto_id,
            cantidad=cantidad
        )
        db.add(nuevo_item)
        db.commit()
        db.refresh(nuevo_item)
        
        return {
            "mensaje": "Producto agregado al carrito",
            "producto_id": producto_id,
            "cantidad": cantidad,
            "stock_disponible": producto.existencia,
            "stock_restante": producto.existencia - cantidad
        }

@app.delete("/carrito/{producto_id}")
async def quitar_del_carrito(producto_id: int, current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.exec(
        select(ItemCarrito).where(
            ItemCarrito.usuario_id == current_user.id,
            ItemCarrito.producto_id == producto_id
        )
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Producto no encontrado en el carrito")
    
    db.delete(item)
    db.commit()
    return {"mensaje": "Producto eliminado"}

@app.post("/carrito/finalizar")
async def finalizar_compra(
    direccion: str = Form(...),
    tarjeta: str = Form(...),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Obtener items del carrito
    items_carrito = db.exec(
        select(ItemCarrito).where(ItemCarrito.usuario_id == current_user.id)
    ).all()
    
    if not items_carrito:
        raise HTTPException(status_code=400, detail="El carrito está vacío")
    
    # Calcular subtotal y obtener productos de la DB
    subtotal = 0
    subtotal_electronics = 0
    subtotal_otros = 0
    items_con_productos = []
    
    for item in items_carrito:
        # Obtener producto de la DB
        producto = db.exec(select(Producto).where(Producto.id == item.producto_id)).first()
        if not producto:
            raise HTTPException(status_code=404, detail=f"Producto {item.producto_id} no encontrado")
        
        # Verificar stock disponible
        if item.cantidad > producto.existencia:
            raise HTTPException(
                status_code=400, 
                detail=f"Stock insuficiente para {producto.titulo}. Disponible: {producto.existencia}, solicitado: {item.cantidad}"
            )
        
        precio_item = producto.precio * item.cantidad
        subtotal += precio_item
        
        # Separar por categoría para IVA diferenciado
        if producto.categoria.lower() == "electronics":
            subtotal_electronics += precio_item
        else:
            subtotal_otros += precio_item
        
        items_con_productos.append((item, producto))
    
    # Calcular IVA según README: 21% general, 10% electrónicos
    iva_electronics = subtotal_electronics * 0.10
    iva_otros = subtotal_otros * 0.21
    iva = iva_electronics + iva_otros
    
    # Calcular envío: gratis si >$1000, sino $50
    envio = 0 if subtotal >= 1000 else 50
    
    # Total
    total = subtotal + iva + envio
    
    # Guardar solo los últimos 4 dígitos de la tarjeta
    tarjeta_ultimos_4 = tarjeta[-4:] if len(tarjeta) >= 4 else tarjeta
    
    # Crear la compra
    compra = Compra(
        usuario_id=current_user.id,
        direccion=direccion,
        tarjeta=tarjeta_ultimos_4,
        total=total,
        envio=envio
    )
    db.add(compra)
    db.commit()
    db.refresh(compra)
    
    # Crear los items de la compra y actualizar stock
    for item, producto in items_con_productos:
        # Crear item de compra
        compra_item = CompraItem(
            compra_id=compra.id,
            producto_id=item.producto_id,
            cantidad=item.cantidad,
            precio_unitario=producto.precio,
            nombre=producto.titulo or producto.nombre
        )
        db.add(compra_item)
        
        # ⭐ ACTUALIZAR STOCK EN LA BASE DE DATOS
        producto.existencia -= item.cantidad
        db.add(producto)
    
    # Vaciar el carrito
    for item in items_carrito:
        db.delete(item)
    
    db.commit()
    
    return {
        "id": compra.id,
        "total": compra.total,
        "direccion": compra.direccion,
        "fecha": compra.fecha,
        "mensaje": "Compra realizada exitosamente"
    }

@app.get("/compras")
async def obtener_compras(current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    # Ordenar por fecha descendente (de más reciente a más antigua)
    compras = db.exec(
        select(Compra)
        .where(Compra.usuario_id == current_user.id)
        .order_by(Compra.fecha.desc())
    ).all()
    
    return [
        {
            "id": compra.id,
            "fecha": compra.fecha,
            "direccion": compra.direccion,
            "total": compra.total,
            "envio": compra.envio,
            "tarjeta": compra.tarjeta
        }
        for compra in compras
    ]

@app.get("/compras/{compra_id}")
async def obtener_detalle_compra(compra_id: int, current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verificar que la compra pertenece al usuario
    compra = db.exec(
        select(Compra).where(
            Compra.id == compra_id,
            Compra.usuario_id == current_user.id
        )
    ).first()
    
    if not compra:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    
    # Obtener items de la compra
    items = db.exec(
        select(CompraItem).where(CompraItem.compra_id == compra_id)
    ).all()
    
    # Construir lista de productos con información adicional desde la DB
    productos = []
    subtotal_total = 0
    iva_total = 0
    
    for item in items:
        # Obtener la imagen y categoría del producto desde la tabla Producto
        producto = db.exec(select(Producto).where(Producto.id == item.producto_id)).first()
        
        # Calcular subtotal
        subtotal = item.precio_unitario * item.cantidad
        
        # Calcular IVA según categoría (21% general, 10% electrónicos)
        if producto and producto.categoria.lower() == "electronics":
            iva = subtotal * 0.10
        else:
            iva = subtotal * 0.21
        
        # Calcular precio total (subtotal + IVA)
        precio_total = subtotal + iva
        
        # Acumular totales
        subtotal_total += subtotal
        iva_total += iva
        
        productos.append({
            "producto_id": item.producto_id,
            "nombre": item.nombre,
            "cantidad": item.cantidad,
            "precio_unitario": item.precio_unitario,
            "subtotal": subtotal,
            "iva": iva,
            "precio_total": precio_total,
            "imagen": producto.imagen if producto else "imagenes/placeholder.png"
        })
    
    return {
        "id": compra.id,
        "fecha": compra.fecha,
        "direccion": compra.direccion,
        "subtotal": subtotal_total,
        "iva": iva_total,
        "total": compra.total,
        "envio": compra.envio,
        "tarjeta": compra.tarjeta,
        "productos": productos
    }

@app.delete("/carrito")
async def cancelar_carrito(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancelar compra - vaciar carrito"""
    items = db.exec(
        select(ItemCarrito).where(ItemCarrito.usuario_id == current_user.id)
    ).all()
    
    for item in items:
        db.delete(item)
    
    db.commit()
    
    return {"mensaje": "Carrito vaciado exitosamente"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)