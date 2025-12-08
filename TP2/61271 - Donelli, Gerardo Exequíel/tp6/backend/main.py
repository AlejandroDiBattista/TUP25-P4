from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import SQLModel, create_engine, Session, select
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Annotated
import json
from pathlib import Path

# Importar todos los modelos
from models import Usuario, Producto, Carrito, ItemCarrito, Compra, ItemCompra
# Importar funciones de autenticación
from auth import hashear_contraseña, verificar_contraseña, crear_access_token, verificar_token

# Configuración de la base de datos
DATABASE_URL = "sqlite:///./ecommerce.db"
engine = create_engine(DATABASE_URL, echo=True)

# Crear la aplicación FastAPI
app = FastAPI(title="API E-Commerce")

# Configuración de seguridad
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


def crear_tablas():
    """Crear todas las tablas en la base de datos."""
    SQLModel.metadata.create_all(engine)


def obtener_session():
    """Dependencia para obtener una sesión de base de datos."""
    with Session(engine) as session:
        yield session


# Schemas Pydantic para requests/responses
class UsuarioRegistro(BaseModel):
    """Schema para registrar un nuevo usuario."""
    nombre: str
    email: EmailStr
    contraseña: str


class UsuarioLogin(BaseModel):
    """Schema para iniciar sesión."""
    email: EmailStr
    contraseña: str


class TokenResponse(BaseModel):
    """Schema para la respuesta del token."""
    access_token: str
    token_type: str = "bearer"
    usuario: dict


# Dependencia para obtener el usuario actual desde el token
def obtener_usuario_actual(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    session: Annotated[Session, Depends(obtener_session)]
) -> Usuario:
    """
    Obtiene el usuario actual desde el token JWT.
    
    Args:
        credentials: Credenciales HTTP Bearer
        session: Sesión de base de datos
        
    Returns:
        Usuario autenticado
        
    Raises:
        HTTPException: Si el token es inválido o el usuario no existe
    """
    token = credentials.credentials
    payload = verificar_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    usuario = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return usuario


def cargar_productos_iniciales():
    """
    Carga los productos desde productos.json a la base de datos.
    Solo carga si la tabla de productos está vacía.
    """
    with Session(engine) as session:
        # Verificar si ya hay productos en la BD
        productos_existentes = session.exec(select(Producto)).first()
        
        if productos_existentes:
            print("ℹ️  Los productos ya están cargados en la base de datos")
            return
        
        # Cargar productos desde JSON
        ruta_productos = Path(__file__).parent / "productos.json"
        with open(ruta_productos, "r", encoding="utf-8") as archivo:
            productos_data = json.load(archivo)
        
        # Insertar productos en la BD
        productos_insertados = 0
        for producto_dict in productos_data:
            producto = Producto(
                id=producto_dict["id"],
                titulo=producto_dict["titulo"],
                precio=producto_dict["precio"],
                descripcion=producto_dict["descripcion"],
                categoria=producto_dict["categoria"],
                valoracion=producto_dict["valoracion"],
                existencia=producto_dict["existencia"],
                imagen=producto_dict["imagen"]
            )
            session.add(producto)
            productos_insertados += 1
        
        session.commit()
        print(f"✅ {productos_insertados} productos cargados desde productos.json a la base de datos")


@app.on_event("startup")
def on_startup():
    """Ejecutar al iniciar la aplicación."""
    crear_tablas()
    print("✅ Base de datos inicializada y tablas creadas")
    cargar_productos_iniciales()


@app.get("/")
def root():
    return {"mensaje": "API E-Commerce - Bienvenido"}


# ==================== ENDPOINTS DE AUTENTICACIÓN ====================

@app.post("/registrar", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def registrar_usuario(
    usuario_data: UsuarioRegistro,
    session: Annotated[Session, Depends(obtener_session)]
):
    """
    Registra un nuevo usuario en el sistema.
    
    Args:
        usuario_data: Datos del usuario a registrar
        session: Sesión de base de datos
        
    Returns:
        Token de acceso y datos del usuario
        
    Raises:
        HTTPException: Si el email ya está registrado
    """
    # Verificar si el email ya existe
    usuario_existente = session.exec(
        select(Usuario).where(Usuario.email == usuario_data.email)
    ).first()
    
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Crear nuevo usuario con contraseña hasheada
    nuevo_usuario = Usuario(
        nombre=usuario_data.nombre,
        email=usuario_data.email,
        password=hashear_contraseña(usuario_data.contraseña)
    )
    
    session.add(nuevo_usuario)
    session.commit()
    session.refresh(nuevo_usuario)
    
    # Crear token de acceso
    access_token = crear_access_token(data={"sub": nuevo_usuario.email})
    
    return TokenResponse(
        access_token=access_token,
        usuario={
            "id": nuevo_usuario.id,
            "nombre": nuevo_usuario.nombre,
            "email": nuevo_usuario.email
        }
    )


@app.post("/iniciar-sesion", response_model=TokenResponse)
def iniciar_sesion(
    credenciales: UsuarioLogin,
    session: Annotated[Session, Depends(obtener_session)]
):
    """
    Inicia sesión y obtiene un token de autenticación.
    
    Args:
        credenciales: Email y contraseña del usuario
        session: Sesión de base de datos
        
    Returns:
        Token de acceso y datos del usuario
        
    Raises:
        HTTPException: Si las credenciales son incorrectas
    """
    # Buscar usuario por email
    usuario = session.exec(
        select(Usuario).where(Usuario.email == credenciales.email)
    ).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    # Verificar contraseña
    if not verificar_contraseña(credenciales.contraseña, usuario.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    # Crear token de acceso
    access_token = crear_access_token(data={"sub": usuario.email})
    
    return TokenResponse(
        access_token=access_token,
        usuario={
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email
        }
    )


@app.post("/cerrar-sesion")
def cerrar_sesion(
    usuario_actual: Annotated[Usuario, Depends(obtener_usuario_actual)]
):
    """
    Cierra la sesión del usuario actual.
    
    Nota: En JWT stateless, el cierre de sesión es manejado por el cliente
    eliminando el token. Este endpoint existe para cumplir con la especificación
    y puede ser extendido para implementar una lista negra de tokens si se requiere.
    
    Args:
        usuario_actual: Usuario autenticado
        
    Returns:
        Mensaje de confirmación
    """
    return {
        "mensaje": "Sesión cerrada exitosamente",
        "usuario": usuario_actual.nombre
    }


# ==================== ENDPOINTS DE PRODUCTOS ====================

@app.get("/productos")
def obtener_productos(
    session: Annotated[Session, Depends(obtener_session)],
    categoria: Optional[str] = None,
    buscar: Optional[str] = None
):
    """
    Obtener lista de productos desde la base de datos con filtros opcionales.
    
    Args:
        categoria: Filtrar por categoría exacta
        buscar: Buscar por contenido en título o descripción (case-insensitive)
        session: Sesión de base de datos
        
    Returns:
        Lista de productos filtrados
        
    Examples:
        GET /productos -> Todos los productos
        GET /productos?categoria=Electrónica -> Solo productos de categoría "Electrónica"
        GET /productos?buscar=mochila -> Productos con "mochila" en título o descripción
        GET /productos?categoria=Electrónica&buscar=laptop -> Electrónica que contenga "laptop"
    """
    # Crear query base
    query = select(Producto)
    
    # Aplicar filtro por categoría si se proporciona
    if categoria:
        query = query.where(Producto.categoria == categoria)
    
    # Aplicar filtro de búsqueda si se proporciona
    if buscar:
        # Buscar en título o descripción (case-insensitive)
        busqueda_lower = f"%{buscar.lower()}%"
        query = query.where(
            (Producto.titulo.ilike(busqueda_lower)) | 
            (Producto.descripcion.ilike(busqueda_lower))
        )
    
    # Ejecutar query y retornar resultados
    productos = session.exec(query).all()
    return productos


@app.get("/productos/{producto_id}")
def obtener_producto_por_id(
    producto_id: int,
    session: Annotated[Session, Depends(obtener_session)]
):
    """
    Obtener detalles de un producto específico por su ID.
    
    Args:
        producto_id: ID del producto a buscar
        session: Sesión de base de datos
        
    Returns:
        Producto encontrado
        
    Raises:
        HTTPException: Si el producto no existe (404)
    """
    producto = session.get(Producto, producto_id)
    
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {producto_id} no encontrado"
        )
    
    return producto


# ==================== ENDPOINTS DEL CARRITO ====================

class AgregarProductoRequest(BaseModel):
    """Schema para agregar un producto al carrito."""
    producto_id: int
    cantidad: int = Field(ge=1, description="Cantidad debe ser mayor a 0")


class CarritoResponse(BaseModel):
    """Schema para la respuesta del carrito."""
    id: int
    estado: str
    items: list
    total: float


@app.post("/carrito", status_code=status.HTTP_201_CREATED)
def agregar_producto_al_carrito(
    request: AgregarProductoRequest,
    usuario_actual: Annotated[Usuario, Depends(obtener_usuario_actual)],
    session: Annotated[Session, Depends(obtener_session)]
):
    """
    Agregar un producto al carrito del usuario autenticado.
    
    Args:
        request: Datos del producto a agregar (producto_id, cantidad)
        usuario_actual: Usuario autenticado
        session: Sesión de base de datos
        
    Returns:
        Mensaje de confirmación con detalles del producto agregado
        
    Raises:
        HTTPException: Si el producto no existe, no hay existencia o cantidad inválida
    """
    # Verificar que el producto existe
    producto = session.get(Producto, request.producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {request.producto_id} no encontrado"
        )
    
    # Verificar que hay existencia disponible
    if producto.existencia < request.cantidad:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stock insuficiente. Disponible: {producto.existencia}, solicitado: {request.cantidad}"
        )
    
    if producto.existencia == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Producto agotado. No hay existencias disponibles"
        )
    
    # Buscar o crear carrito activo del usuario
    carrito_activo = session.exec(
        select(Carrito).where(
            Carrito.usuario_id == usuario_actual.id,
            Carrito.estado == "activo"
        )
    ).first()
    
    if not carrito_activo:
        # Crear nuevo carrito
        carrito_activo = Carrito(
            usuario_id=usuario_actual.id,
            estado="activo"
        )
        session.add(carrito_activo)
        session.commit()
        session.refresh(carrito_activo)
    
    # Verificar si el producto ya está en el carrito
    item_existente = session.exec(
        select(ItemCarrito).where(
            ItemCarrito.carrito_id == carrito_activo.id,
            ItemCarrito.producto_id == request.producto_id
        )
    ).first()
    
    if item_existente:
        # Actualizar cantidad si ya existe
        nueva_cantidad = item_existente.cantidad + request.cantidad
        
        # Verificar que la nueva cantidad no exceda la existencia
        if nueva_cantidad > producto.existencia:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente. Ya tienes {item_existente.cantidad} en el carrito. Disponible: {producto.existencia}"
            )
        
        item_existente.cantidad = nueva_cantidad
        session.add(item_existente)
        mensaje = f"Cantidad actualizada a {nueva_cantidad} unidades"
    else:
        # Agregar nuevo item al carrito
        nuevo_item = ItemCarrito(
            carrito_id=carrito_activo.id,
            producto_id=request.producto_id,
            cantidad=request.cantidad
        )
        session.add(nuevo_item)
        mensaje = f"Producto agregado al carrito"
    
    session.commit()
    
    return {
        "mensaje": mensaje,
        "producto": {
            "id": producto.id,
            "titulo": producto.titulo,
            "precio": producto.precio,
            "cantidad": request.cantidad if not item_existente else item_existente.cantidad
        },
        "carrito_id": carrito_activo.id
    }


@app.get("/carrito")
def ver_carrito(
    usuario_actual: Annotated[Usuario, Depends(obtener_usuario_actual)],
    session: Annotated[Session, Depends(obtener_session)]
):
    """
    Obtener el carrito activo del usuario autenticado con todos sus items.
    
    Args:
        usuario_actual: Usuario autenticado
        session: Sesión de base de datos
        
    Returns:
        Carrito con items y total
    """
    # Buscar carrito activo del usuario
    carrito_activo = session.exec(
        select(Carrito).where(
            Carrito.usuario_id == usuario_actual.id,
            Carrito.estado == "activo"
        )
    ).first()
    
    if not carrito_activo:
        return {
            "mensaje": "El carrito está vacío",
            "items": [],
            "total": 0,
            "cantidad_items": 0
        }
    
    # Obtener items del carrito con información de productos
    items_carrito = session.exec(
        select(ItemCarrito).where(ItemCarrito.carrito_id == carrito_activo.id)
    ).all()
    
    items_detallados = []
    total = 0
    
    for item in items_carrito:
        producto = session.get(Producto, item.producto_id)
        if producto:
            subtotal = producto.precio * item.cantidad
            total += subtotal
            
            items_detallados.append({
                "id": item.id,
                "producto_id": producto.id,
                "titulo": producto.titulo,
                "precio_unitario": producto.precio,
                "cantidad": item.cantidad,
                "subtotal": subtotal,
                "imagen": producto.imagen,
                "existencia_disponible": producto.existencia
            })
    
    return {
        "carrito_id": carrito_activo.id,
        "estado": carrito_activo.estado,
        "items": items_detallados,
        "total": total,
        "cantidad_items": len(items_detallados)
    }


@app.delete("/carrito/{producto_id}", status_code=status.HTTP_200_OK)
def quitar_producto_del_carrito(
    producto_id: int,
    usuario_actual: Annotated[Usuario, Depends(obtener_usuario_actual)],
    session: Annotated[Session, Depends(obtener_session)]
):
    """
    Quitar un producto del carrito del usuario autenticado.
    
    Args:
        producto_id: ID del producto a quitar
        usuario_actual: Usuario autenticado
        session: Sesión de base de datos
        
    Returns:
        Mensaje de confirmación
        
    Raises:
        HTTPException: Si el carrito no existe, está finalizado o el producto no está en el carrito
    """
    # Buscar carrito activo del usuario
    carrito_activo = session.exec(
        select(Carrito).where(
            Carrito.usuario_id == usuario_actual.id,
            Carrito.estado == "activo"
        )
    ).first()
    
    if not carrito_activo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tienes un carrito activo"
        )
    
    # Buscar el item en el carrito
    item = session.exec(
        select(ItemCarrito).where(
            ItemCarrito.carrito_id == carrito_activo.id,
            ItemCarrito.producto_id == producto_id
        )
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El producto no está en tu carrito"
        )
    
    # Obtener información del producto antes de eliminar
    producto = session.get(Producto, producto_id)
    
    # Eliminar el item del carrito
    session.delete(item)
    session.commit()
    
    return {
        "mensaje": "Producto eliminado del carrito",
        "producto": {
            "id": producto_id,
            "titulo": producto.titulo if producto else "Producto eliminado"
        }
    }


@app.post("/carrito/cancelar")
def cancelar_carrito(
    usuario_actual: Annotated[Usuario, Depends(obtener_usuario_actual)],
    session: Annotated[Session, Depends(obtener_session)]
):
    """
    Cancelar (vaciar) el carrito del usuario autenticado.
    
    Args:
        usuario_actual: Usuario autenticado
        session: Sesión de base de datos
        
    Returns:
        Mensaje de confirmación
        
    Raises:
        HTTPException: Si no hay carrito activo
    """
    # Buscar carrito activo del usuario
    carrito_activo = session.exec(
        select(Carrito).where(
            Carrito.usuario_id == usuario_actual.id,
            Carrito.estado == "activo"
        )
    ).first()
    
    if not carrito_activo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tienes un carrito activo para cancelar"
        )
    
    # Eliminar todos los items del carrito
    items = session.exec(
        select(ItemCarrito).where(ItemCarrito.carrito_id == carrito_activo.id)
    ).all()
    
    cantidad_items = len(items)
    
    for item in items:
        session.delete(item)
    
    # Cambiar estado del carrito a cancelado
    carrito_activo.estado = "cancelado"
    session.add(carrito_activo)
    session.commit()
    
    return {
        "mensaje": "Carrito cancelado exitosamente",
        "items_eliminados": cantidad_items
    }


# ==================== ENDPOINTS DE COMPRA ====================

class FinalizarCompraRequest(BaseModel):
    """Schema para finalizar una compra."""
    direccion: str = Field(min_length=10, description="Dirección de envío")
    tarjeta: str = Field(min_length=4, max_length=4, description="Últimos 4 dígitos de la tarjeta")


class CompraResponse(BaseModel):
    """Schema para la respuesta de una compra finalizada."""
    compra_id: int
    mensaje: str
    subtotal: float
    iva: float
    envio: float
    total: float
    items: list


@app.post("/carrito/finalizar", response_model=CompraResponse, status_code=status.HTTP_201_CREATED)
def finalizar_compra(
    datos: FinalizarCompraRequest,
    usuario_actual: Annotated[Usuario, Depends(obtener_usuario_actual)],
    session: Annotated[Session, Depends(obtener_session)]
):
    """
    Finalizar la compra del carrito activo del usuario.
    
    Proceso:
    1. Validar que existe un carrito activo con items
    2. Calcular subtotal de productos
    3. Calcular IVA (21% general, 10% para electrónica)
    4. Calcular envío (gratis si total > $1000, sino $50)
    5. Reducir existencias de productos
    6. Crear registro de Compra con ItemsCompra
    7. Cambiar estado del carrito a "finalizado"
    
    Args:
        datos: Dirección de envío y últimos 4 dígitos de tarjeta
        usuario_actual: Usuario autenticado
        session: Sesión de base de datos
        
    Returns:
        Detalles de la compra finalizada con totales
        
    Raises:
        HTTPException: Si no hay carrito activo, carrito vacío o stock insuficiente
    """
    from datetime import datetime
    
    # Buscar carrito activo del usuario
    carrito_activo = session.exec(
        select(Carrito).where(
            Carrito.usuario_id == usuario_actual.id,
            Carrito.estado == "activo"
        )
    ).first()
    
    if not carrito_activo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tienes un carrito activo para finalizar"
        )
    
    # Obtener items del carrito
    items_carrito = session.exec(
        select(ItemCarrito).where(ItemCarrito.carrito_id == carrito_activo.id)
    ).all()
    
    if not items_carrito:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes finalizar una compra con el carrito vacío"
        )
    
    # Calcular subtotal y preparar items de compra
    subtotal = 0
    items_compra = []
    subtotal_electronica = 0
    subtotal_general = 0
    
    for item in items_carrito:
        producto = session.get(Producto, item.producto_id)
        
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto con ID {item.producto_id} no encontrado"
            )
        
        # Verificar stock disponible
        if producto.existencia < item.cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente para '{producto.titulo}'. Disponible: {producto.existencia}, solicitado: {item.cantidad}"
            )
        
        # Calcular subtotal del item
        subtotal_item = producto.precio * item.cantidad
        subtotal += subtotal_item
        
        # Separar subtotal por categoría para cálculo de IVA
        if producto.categoria == "Electrónica":
            subtotal_electronica += subtotal_item
        else:
            subtotal_general += subtotal_item
        
        # Guardar información para crear ItemCompra
        items_compra.append({
            "producto": producto,
            "cantidad": item.cantidad,
            "precio_unitario": producto.precio,
            "nombre": producto.titulo
        })
    
    # Calcular IVA: 10% para electrónica, 21% para el resto
    iva_electronica = subtotal_electronica * 0.10
    iva_general = subtotal_general * 0.21
    iva_total = iva_electronica + iva_general
    
    # Calcular envío: gratis si subtotal > $1000, sino $50
    costo_envio = 0 if subtotal > 1000 else 50
    
    # Calcular total final
    total_final = subtotal + iva_total + costo_envio
    
    # Reducir existencias de productos
    for item_info in items_compra:
        producto = item_info["producto"]
        producto.existencia -= item_info["cantidad"]
        session.add(producto)
    
    # Crear registro de compra
    nueva_compra = Compra(
        usuario_id=usuario_actual.id,
        fecha=datetime.now(),
        direccion=datos.direccion,
        tarjeta=datos.tarjeta,
        total=total_final,
        envio=costo_envio
    )
    session.add(nueva_compra)
    session.commit()
    session.refresh(nueva_compra)
    
    # Crear items de compra (snapshot de productos al momento de la compra)
    items_response = []
    for item_info in items_compra:
        item_compra = ItemCompra(
            compra_id=nueva_compra.id,
            producto_id=item_info["producto"].id,
            cantidad=item_info["cantidad"],
            nombre=item_info["nombre"],
            precio_unitario=item_info["precio_unitario"]
        )
        session.add(item_compra)
        
        items_response.append({
            "producto_id": item_info["producto"].id,
            "titulo": item_info["nombre"],
            "cantidad": item_info["cantidad"],
            "precio_unitario": item_info["precio_unitario"],
            "subtotal": item_info["precio_unitario"] * item_info["cantidad"]
        })
    
    # Eliminar items del carrito y cambiar estado a finalizado
    for item in items_carrito:
        session.delete(item)
    
    carrito_activo.estado = "finalizado"
    session.add(carrito_activo)
    
    session.commit()
    
    return CompraResponse(
        compra_id=nueva_compra.id,
        mensaje="Compra finalizada exitosamente",
        subtotal=subtotal,
        iva=iva_total,
        envio=costo_envio,
        total=total_final,
        items=items_response
    )


# ==================== ENDPOINTS DE HISTORIAL DE COMPRAS ====================

@app.get("/compras")
def obtener_historial_compras(
    usuario_actual: Annotated[Usuario, Depends(obtener_usuario_actual)],
    session: Annotated[Session, Depends(obtener_session)]
):
    """
    Obtener el historial de compras del usuario autenticado.
    
    Retorna un resumen de todas las compras realizadas por el usuario,
    ordenadas de más reciente a más antigua.
    
    Args:
        usuario_actual: Usuario autenticado
        session: Sesión de base de datos
        
    Returns:
        Lista de compras con resumen (sin items detallados)
    """
    # Obtener todas las compras del usuario ordenadas por fecha descendente
    compras = session.exec(
        select(Compra)
        .where(Compra.usuario_id == usuario_actual.id)
        .order_by(Compra.fecha.desc())
    ).all()
    
    if not compras:
        return {
            "mensaje": "No tienes compras realizadas",
            "compras": []
        }
    
    # Preparar resumen de compras
    compras_resumen = []
    for compra in compras:
        # Contar items de la compra
        items_count = session.exec(
            select(ItemCompra).where(ItemCompra.compra_id == compra.id)
        ).all()
        
        compras_resumen.append({
            "id": compra.id,
            "fecha": compra.fecha.isoformat(),
            "total": compra.total,
            "envio": compra.envio,
            "direccion": compra.direccion,
            "cantidad_productos": len(items_count)
        })
    
    return {
        "compras": compras_resumen,
        "total_compras": len(compras)
    }


@app.get("/compras/{compra_id}")
def obtener_detalle_compra(
    compra_id: int,
    usuario_actual: Annotated[Usuario, Depends(obtener_usuario_actual)],
    session: Annotated[Session, Depends(obtener_session)]
):
    """
    Obtener el detalle completo de una compra específica.
    
    Incluye todos los items comprados con su información al momento de la compra.
    
    Args:
        compra_id: ID de la compra a consultar
        usuario_actual: Usuario autenticado
        session: Sesión de base de datos
        
    Returns:
        Detalle completo de la compra con todos sus items
        
    Raises:
        HTTPException: Si la compra no existe o no pertenece al usuario
    """
    # Buscar la compra
    compra = session.get(Compra, compra_id)
    
    if not compra:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Compra con ID {compra_id} no encontrada"
        )
    
    # Verificar que la compra pertenece al usuario actual
    if compra.usuario_id != usuario_actual.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver esta compra"
        )
    
    # Obtener items de la compra
    items_compra = session.exec(
        select(ItemCompra).where(ItemCompra.compra_id == compra_id)
    ).all()
    
    # Preparar detalle de items
    items_detalle = []
    subtotal = 0
    
    for item in items_compra:
        subtotal_item = item.precio_unitario * item.cantidad
        subtotal += subtotal_item
        
        # Obtener imagen del producto actual (puede haber cambiado desde la compra)
        producto_actual = session.get(Producto, item.producto_id)
        imagen = producto_actual.imagen if producto_actual else "imagenes/default.png"
        
        items_detalle.append({
            "producto_id": item.producto_id,
            "nombre": item.nombre,
            "precio_unitario": item.precio_unitario,
            "cantidad": item.cantidad,
            "subtotal": subtotal_item,
            "imagen": imagen
        })
    
    # Calcular IVA (total - subtotal - envío)
    iva_calculado = compra.total - subtotal - compra.envio
    
    return {
        "id": compra.id,
        "fecha": compra.fecha.isoformat(),
        "direccion": compra.direccion,
        "tarjeta": f"****{compra.tarjeta}",  # Mostrar solo últimos 4 dígitos
        "subtotal": subtotal,
        "iva": iva_calculado,
        "envio": compra.envio,
        "total": compra.total,
        "items": items_detalle,
        "cantidad_productos": len(items_detalle)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
