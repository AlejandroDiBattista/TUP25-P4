from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select, SQLModel
import json
from pathlib import Path
from typing import Optional, List

from database import create_db_and_tables, get_session
from models.usuario import Usuario, UsuarioCreate, UsuarioLogin, UsuarioResponse, Token
from models.compra import Compra, CompraItem, CompraCreate, CompraResponse, CompraItemResponse
from auth import hash_password, verify_password, create_access_token, verify_token

# Modelo para agregar al carrito
class AgregarCarritoRequest(SQLModel):
    producto_id: int
    cantidad: int = 1

app = FastAPI(title="API E-Commerce")

# Crear tablas al iniciar
@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# Security
security = HTTPBearer()

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

# Dependencia para obtener usuario actual
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> Usuario:
    """Obtener el usuario actual desde el token JWT"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )
    
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
    
    usuario = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )
    
    return usuario

# Cargar productos desde el archivo JSON
def cargar_productos():
    ruta_productos = Path(__file__).parent / "productos.json"
    with open(ruta_productos, "r", encoding="utf-8") as archivo:
        return json.load(archivo)

def guardar_productos(productos):
    """Guardar productos actualizados en el archivo JSON"""
    ruta_productos = Path(__file__).parent / "productos.json"
    with open(ruta_productos, "w", encoding="utf-8") as archivo:
        json.dump(productos, archivo, indent=4, ensure_ascii=False)

@app.get("/")
def root():
    return {"mensaje": "API E-Commerce - Endpoints: /productos, /registrar, /iniciar-sesion"}

@app.get("/productos")
def obtener_productos(
    busqueda: Optional[str] = None,
    categoria: Optional[str] = None
):
    productos = cargar_productos()
    
    # Filtrar por búsqueda (en nombre o descripción)
    if busqueda:
        busqueda_lower = busqueda.lower()
        productos = [
            p for p in productos
            if busqueda_lower in p["nombre"].lower() or busqueda_lower in p["descripcion"].lower()
        ]
    
    # Filtrar por categoría
    if categoria and categoria != "todas":
        productos = [p for p in productos if p["categoria"] == categoria]
    
    return productos

@app.get("/productos/{producto_id}")
def obtener_producto(producto_id: int):
    """Obtener un producto específico por ID"""
    productos = cargar_productos()
    producto = next((p for p in productos if p["id"] == producto_id), None)
    
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    return producto

# ===== ENDPOINTS DE AUTENTICACIÓN =====

@app.post("/registrar", response_model=Token, status_code=status.HTTP_201_CREATED)
def registrar_usuario(usuario_data: UsuarioCreate, session: Session = Depends(get_session)):
    """Registrar un nuevo usuario"""
    # Verificar si el email ya existe
    usuario_existente = session.exec(
        select(Usuario).where(Usuario.email == usuario_data.email)
    ).first()
    
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Crear nuevo usuario
    password_hash = hash_password(usuario_data.password)
    nuevo_usuario = Usuario(
        nombre=usuario_data.nombre,
        email=usuario_data.email,
        password_hash=password_hash
    )
    
    session.add(nuevo_usuario)
    session.commit()
    session.refresh(nuevo_usuario)
    
    # Crear token
    access_token = create_access_token(data={"sub": nuevo_usuario.email})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        usuario=UsuarioResponse(
            id=nuevo_usuario.id,
            nombre=nuevo_usuario.nombre,
            email=nuevo_usuario.email
        )
    )

@app.post("/iniciar-sesion", response_model=Token)
def iniciar_sesion(credenciales: UsuarioLogin, session: Session = Depends(get_session)):
    """Iniciar sesión"""
    # Buscar usuario
    usuario = session.exec(
        select(Usuario).where(Usuario.email == credenciales.email)
    ).first()
    
    if not usuario or not verify_password(credenciales.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    # Crear token
    access_token = create_access_token(data={"sub": usuario.email})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        usuario=UsuarioResponse(
            id=usuario.id,
            nombre=usuario.nombre,
            email=usuario.email
        )
    )

@app.post("/cerrar-sesion")
def cerrar_sesion(usuario_actual: Usuario = Depends(get_current_user)):
    """Cerrar sesión (en cliente se debe eliminar el token)"""
    return {"mensaje": "Sesión cerrada exitosamente"}

@app.get("/usuario-actual", response_model=UsuarioResponse)
def obtener_usuario_actual(usuario_actual: Usuario = Depends(get_current_user)):
    """Obtener información del usuario actual"""
    return UsuarioResponse(
        id=usuario_actual.id,
        nombre=usuario_actual.nombre,
        email=usuario_actual.email
    )

# ===== ENDPOINTS DE COMPRAS =====

@app.post("/carrito/agregar")
def agregar_al_carrito(request: AgregarCarritoRequest):
    """Descontar stock al agregar producto al carrito"""
    productos = cargar_productos()
    
    # Buscar producto
    producto = next((p for p in productos if p["id"] == request.producto_id), None)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    # Validar stock
    if request.cantidad > producto["existencia"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stock insuficiente. Solo quedan {producto['existencia']} unidades"
        )
    
    # Descontar stock
    producto["existencia"] -= request.cantidad
    
    # Guardar productos actualizados
    guardar_productos(productos)
    
    return {
        "mensaje": "Producto agregado al carrito",
        "producto_id": request.producto_id,
        "cantidad": request.cantidad,
        "stock_restante": producto["existencia"]
    }

@app.post("/carrito/finalizar", response_model=CompraResponse, status_code=status.HTTP_201_CREATED)
def finalizar_compra(
    compra_data: CompraCreate,
    usuario_actual: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Finalizar compra y crear registro en base de datos"""
    productos = cargar_productos()
    
    # Calcular total y validar stock
    total = 0
    items_compra = []
    
    for item_data in compra_data.items:
        # Buscar producto
        producto = next((p for p in productos if p["id"] == item_data.producto_id), None)
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto {item_data.producto_id} no encontrado"
            )
        
        # Validar stock
        if item_data.cantidad > producto["existencia"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente para {producto['titulo']}"
            )
        
        subtotal = producto["precio"] * item_data.cantidad
        total += subtotal
        
        # Crear item de compra
        item = CompraItem(
            producto_id=producto["id"],
            producto_titulo=producto["titulo"],
            producto_imagen=producto["imagen"],
            producto_categoria=producto["categoria"],
            cantidad=item_data.cantidad,
            precio_unitario=producto["precio"],
            subtotal=subtotal
        )
        items_compra.append(item)
    
    # Crear compra
    compra = Compra(
        usuario_id=usuario_actual.id,
        total=total,
        estado="completada",
        direccion=compra_data.direccion,
        ciudad=compra_data.ciudad,
        codigo_postal=compra_data.codigo_postal,
        telefono=compra_data.telefono
    )
    
    session.add(compra)
    session.commit()
    session.refresh(compra)
    
    # Agregar items a la compra
    for item in items_compra:
        item.compra_id = compra.id
        session.add(item)
    
    session.commit()
    
    # Cargar items para respuesta
    session.refresh(compra)
    
    return CompraResponse(
        id=compra.id,
        usuario_id=compra.usuario_id,
        fecha=compra.fecha,
        total=compra.total,
        estado=compra.estado,
        direccion=compra.direccion,
        ciudad=compra.ciudad,
        codigo_postal=compra.codigo_postal,
        telefono=compra.telefono,
        items=[
            CompraItemResponse(
                id=item.id,
                producto_id=item.producto_id,
                producto_titulo=item.producto_titulo,
                producto_imagen=item.producto_imagen,
                producto_categoria=item.producto_categoria,
                cantidad=item.cantidad,
                precio_unitario=item.precio_unitario,
                subtotal=item.subtotal
            )
            for item in compra.items
        ]
    )

@app.get("/compras", response_model=List[CompraResponse])
def obtener_compras(
    usuario_actual: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Obtener todas las compras del usuario actual"""
    compras = session.exec(
        select(Compra)
        .where(Compra.usuario_id == usuario_actual.id)
        .order_by(Compra.fecha.desc())
    ).all()
    
    return [
        CompraResponse(
            id=compra.id,
            usuario_id=compra.usuario_id,
            fecha=compra.fecha,
            total=compra.total,
            estado=compra.estado,
            direccion=compra.direccion,
            ciudad=compra.ciudad,
            codigo_postal=compra.codigo_postal,
            telefono=compra.telefono,
            items=[
                CompraItemResponse(
                    id=item.id,
                    producto_id=item.producto_id,
                    producto_titulo=item.producto_titulo,
                    producto_imagen=item.producto_imagen,
                    producto_categoria=item.producto_categoria,
                    cantidad=item.cantidad,
                    precio_unitario=item.precio_unitario,
                    subtotal=item.subtotal
                )
                for item in compra.items
            ]
        )
        for compra in compras
    ]

@app.get("/compras/{compra_id}", response_model=CompraResponse)
def obtener_compra(
    compra_id: int,
    usuario_actual: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Obtener detalle de una compra específica"""
    compra = session.get(Compra, compra_id)
    
    if not compra:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compra no encontrada"
        )
    
    # Verificar que la compra pertenezca al usuario
    if compra.usuario_id != usuario_actual.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver esta compra"
        )
    
    return CompraResponse(
        id=compra.id,
        usuario_id=compra.usuario_id,
        fecha=compra.fecha,
        total=compra.total,
        estado=compra.estado,
        direccion=compra.direccion,
        ciudad=compra.ciudad,
        codigo_postal=compra.codigo_postal,
        telefono=compra.telefono,
        items=[
            CompraItemResponse(
                id=item.id,
                producto_id=item.producto_id,
                producto_titulo=item.producto_titulo,
                producto_imagen=item.producto_imagen,
                producto_categoria=item.producto_categoria,
                cantidad=item.cantidad,
                precio_unitario=item.precio_unitario,
                subtotal=item.subtotal
            )
            for item in compra.items
        ]
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
