from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field, ConfigDict
import json
from pathlib import Path
from typing import Optional

# Importar modelos y database
from models import Producto, Usuario, Carrito, ItemCarrito, Compra, ItemCompra
from database import create_db_and_tables, get_session, engine
from sqlmodel import Session, select

# Importar funciones de autenticación
from auth import obtener_hash_contraseña, verificar_contraseña, crear_access_token
from dependencies import get_current_user

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


# ========================================
# MODELOS PYDANTIC PARA REQUESTS/RESPONSES
# ========================================

class RegistroRequest(BaseModel):
    """Modelo para registro de usuario."""
    model_config = ConfigDict(str_strip_whitespace=True)
    nombre: str = Field(min_length=3, max_length=255)
    email: EmailStr
    password: str = Field(min_length=6, max_length=255)


class LoginRequest(BaseModel):
    """Modelo para inicio de sesión."""
    model_config = ConfigDict(str_strip_whitespace=True)
    email: EmailStr
    password: str = Field(min_length=6, max_length=255)


class TokenResponse(BaseModel):
    """Modelo para respuesta de token."""
    access_token: str
    token_type: str = "bearer"
    nombre: str
    email: EmailStr


class MensajeResponse(BaseModel):
    """Modelo para mensajes generales."""
    mensaje: str


class AgregarCarritoRequest(BaseModel):
    """Modelo para agregar producto al carrito."""
    producto_id: int
    cantidad: int = Field(gt=0)


class ActualizarCarritoRequest(BaseModel):
    """Modelo para actualizar cantidad de un producto en el carrito."""
    cantidad: int = Field(ge=0)


class ItemCarritoResponse(BaseModel):
    """Modelo para item de carrito en respuesta."""
    producto_id: int
    nombre: str
    categoria: str
    precio: float
    cantidad: int
    subtotal: float
    stock_disponible: int
    imagen: str


class CarritoResponse(BaseModel):
    """Modelo para respuesta de carrito."""
    items: list[ItemCarritoResponse]
    subtotal: float
    iva: float
    envio: float
    total: float


class FinalizarCompraRequest(BaseModel):
    """Modelo para finalizar compra."""
    model_config = ConfigDict(str_strip_whitespace=True)
    direccion: str = Field(min_length=8, max_length=500)
    tarjeta: str = Field(pattern=r"^\d{16}$")


class CompraResponse(BaseModel):
    """Modelo para respuesta de compra finalizada."""
    compra_id: int
    subtotal: float
    iva: float
    envio: float
    total: float


class ItemCompraResponse(BaseModel):
    """Modelo para item de compra en respuesta."""
    producto_id: int
    nombre: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class CompraResumenResponse(BaseModel):
    """Modelo para resumen de compra en lista."""
    id: int
    fecha: str
    total: float
    envio: float
    cantidad_items: int


class CompraDetalleResponse(BaseModel):
    """Modelo para detalle completo de una compra."""
    id: int
    fecha: str
    direccion: str
    tarjeta: str
    items: list[ItemCompraResponse]
    subtotal: float
    envio: float
    total: float


class UsuarioActualResponse(BaseModel):
    """Modelo para devolver datos del usuario autenticado."""
    nombre: str
    email: EmailStr


# Evento de inicio: crear tablas y cargar datos iniciales
@app.on_event("startup")
def on_startup():
    """Inicializar base de datos y cargar productos desde JSON."""
    # Crear todas las tablas
    create_db_and_tables()
    
    # Cargar productos desde JSON si la tabla está vacía
    with Session(engine) as session:
        productos_existentes = session.exec(select(Producto)).first()
        
        if not productos_existentes:
            # Cargar productos desde el archivo JSON
            ruta_productos = Path(__file__).parent / "productos.json"
            with open(ruta_productos, "r", encoding="utf-8") as archivo:
                productos_json = json.load(archivo)
            
            # Insertar productos en la base de datos
            for producto_data in productos_json:
                producto = Producto(
                    id=producto_data["id"],
                    nombre=producto_data["titulo"],
                    descripcion=producto_data["descripcion"],
                    precio=producto_data["precio"],
                    categoria=producto_data["categoria"],
                    existencia=producto_data["existencia"],
                    imagen=producto_data["imagen"]
                )
                session.add(producto)
            
            session.commit()
            print(f"✅ {len(productos_json)} productos cargados en la base de datos")


@app.get("/")
def root():
    return {"mensaje": "API de Productos - use /productos para obtener el listado"}


# ========================================
# ENDPOINTS DE PRODUCTOS
# ========================================

@app.get("/productos")
def obtener_productos(
    categoria: Optional[str] = None,
    buscar: Optional[str] = None
):
    """
    Obtener productos con filtros opcionales.
    
    - categoria: Filtrar por categoría (búsqueda parcial, case-insensitive)
    - buscar: Buscar en nombre y descripción (búsqueda parcial, case-insensitive)
    - Ambos filtros se pueden combinar
    """
    with Session(engine) as session:
        query = select(Producto)
        
        # Filtrar por categoría si se proporciona
        if categoria:
            query = query.where(Producto.categoria.ilike(f"%{categoria}%"))
        
        # Buscar en nombre y descripción si se proporciona
        if buscar:
            query = query.where(
                (Producto.nombre.ilike(f"%{buscar}%")) | 
                (Producto.descripcion.ilike(f"%{buscar}%"))
            )
        
        productos = session.exec(query).all()
        return productos


@app.get("/productos/{producto_id}")
def obtener_producto_por_id(producto_id: int):
    """
    Obtener un producto específico por ID.
    
    - Retorna el producto si existe
    - Error 404 si el producto no existe
    """
    with Session(engine) as session:
        producto = session.get(Producto, producto_id)
        
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto con ID {producto_id} no encontrado"
            )
        
        return producto


# ========================================
# ENDPOINTS DE AUTENTICACIÓN
# ========================================

@app.post("/registrar", response_model=MensajeResponse, status_code=status.HTTP_201_CREATED)
def registrar_usuario(datos: RegistroRequest):
    """
    Registrar un nuevo usuario en el sistema.
    
    - Valida que el email no esté registrado
    - Hashea la contraseña con bcrypt
    - Crea el usuario en la base de datos
    - Crea un carrito activo para el usuario
    """
    with Session(engine) as session:
        # Verificar si el email ya está registrado
        usuario_existente = session.exec(
            select(Usuario).where(Usuario.email == datos.email)
        ).first()
        
        if usuario_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )
        
        # Crear nuevo usuario con contraseña hasheada
        nuevo_usuario = Usuario(
            nombre=datos.nombre,
            email=datos.email,
            contraseña=obtener_hash_contraseña(datos.password)
        )
        session.add(nuevo_usuario)
        session.commit()
        session.refresh(nuevo_usuario)
        
        # Crear carrito activo para el nuevo usuario
        carrito = Carrito(
            usuario_id=nuevo_usuario.id,
            estado="activo"
        )
        session.add(carrito)
        session.commit()
        
        return MensajeResponse(mensaje="Usuario registrado exitosamente")


@app.post("/iniciar-sesion", response_model=TokenResponse)
def iniciar_sesion(datos: LoginRequest):
    """
    Iniciar sesión con email y contraseña.
    
    - Valida que el usuario exista
    - Verifica la contraseña con bcrypt
    - Genera y retorna un JWT con 30 minutos de expiración
    """
    with Session(engine) as session:
        # Buscar usuario por email
        usuario = session.exec(
            select(Usuario).where(Usuario.email == datos.email)
        ).first()
        
        # Validar credenciales
        if not usuario or not verificar_contraseña(datos.password, usuario.contraseña):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Crear token JWT
        access_token = crear_access_token(data={"sub": usuario.email})
        
        return TokenResponse(
            access_token=access_token,
            nombre=usuario.nombre,
            email=usuario.email
        )
@app.get("/usuarios/me", response_model=UsuarioActualResponse)
def obtener_usuario_actual(usuario_actual: Usuario = Depends(get_current_user)):
    """Obtener los datos básicos del usuario autenticado."""
    return UsuarioActualResponse(nombre=usuario_actual.nombre, email=usuario_actual.email)



@app.post("/cerrar-sesion", response_model=MensajeResponse)
def cerrar_sesion(usuario_actual: Usuario = Depends(get_current_user)):
    """
    Cerrar sesión del usuario actual.
    
    Nota: Con JWT stateless, el token seguirá siendo válido hasta su expiración.
    El cliente debe eliminar el token de su almacenamiento local.
    
    Requiere autenticación (Bearer token).
    """
    # En una implementación real, aquí se podría agregar el token a una blacklist
    # Por ahora, simplemente confirmamos que el usuario está autenticado
    return MensajeResponse(
        mensaje=f"Sesión cerrada exitosamente para {usuario_actual.nombre}"
    )


# ========================================
# ENDPOINTS DE CARRITO
# ========================================

@app.get("/carrito", response_model=CarritoResponse)
def ver_carrito(usuario_actual: Usuario = Depends(get_current_user)):
    """
    Ver el carrito actual del usuario autenticado.
    
    - Retorna lista de items con producto, cantidad y subtotal
    - Retorna total del carrito
    - Requiere autenticación
    """
    with Session(engine) as session:
        # Obtener carrito activo del usuario
        carrito = session.exec(
            select(Carrito).where(
                Carrito.usuario_id == usuario_actual.id,
                Carrito.estado == "activo"
            )
        ).first()
        
        if not carrito:
            # Si no hay carrito activo, retornar carrito vacío
            return CarritoResponse(items=[], subtotal=0.0, iva=0.0, envio=0.0, total=0.0)
        
        # Obtener items del carrito con información de productos
        items_carrito = session.exec(
            select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)
        ).all()
        
        items_response: list[ItemCarritoResponse] = []
        subtotal = 0.0
        iva_total = 0.0
        
        for item in items_carrito:
            producto = session.get(Producto, item.producto_id)
            if producto:
                item_subtotal = producto.precio * item.cantidad
                subtotal += item_subtotal
                
                tasa_iva = 0.10 if producto.categoria == "Electrónica" else 0.21
                iva_total += item_subtotal * tasa_iva
                
                items_response.append(ItemCarritoResponse(
                    producto_id=producto.id,
                    nombre=producto.nombre,
                    categoria=producto.categoria,
                    precio=producto.precio,
                    cantidad=item.cantidad,
                    subtotal=item_subtotal,
                    stock_disponible=producto.existencia,
                    imagen=producto.imagen
                ))
        
        envio = 0.0 if subtotal > 1000 else 50.0 if subtotal > 0 else 0.0
        total = subtotal + iva_total + envio
        
        return CarritoResponse(
            items=items_response,
            subtotal=subtotal,
            iva=iva_total,
            envio=envio,
            total=total
        )


@app.post("/carrito", response_model=MensajeResponse, status_code=status.HTTP_201_CREATED)
def agregar_al_carrito(
    datos: AgregarCarritoRequest,
    usuario_actual: Usuario = Depends(get_current_user)
):
    """
    Agregar producto al carrito del usuario.
    
    - Valida que el producto exista
    - Valida que haya stock suficiente
    - Si el producto ya está en el carrito, suma la cantidad
    - Si no existe carrito activo, lo crea
    - Requiere autenticación
    """
    with Session(engine) as session:
        # Validar cantidad positiva
        if datos.cantidad <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La cantidad debe ser mayor a 0"
            )

        # Validar que el producto existe
        producto = session.get(Producto, datos.producto_id)
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto con ID {datos.producto_id} no encontrado"
            )
        
        # Validar que hay stock suficiente
        if producto.existencia < datos.cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente. Disponible: {producto.existencia}, solicitado: {datos.cantidad}"
            )
        
        # Obtener o crear carrito activo
        carrito = session.exec(
            select(Carrito).where(
                Carrito.usuario_id == usuario_actual.id,
                Carrito.estado == "activo"
            )
        ).first()
        
        if not carrito:
            # Crear nuevo carrito
            carrito = Carrito(
                usuario_id=usuario_actual.id,
                estado="activo"
            )
            session.add(carrito)
            session.commit()
            session.refresh(carrito)
        
        # Verificar si el producto ya está en el carrito
        item_existente = session.exec(
            select(ItemCarrito).where(
                ItemCarrito.carrito_id == carrito.id,
                ItemCarrito.producto_id == datos.producto_id
            )
        ).first()
        
        if item_existente:
            # Validar stock para la suma
            nueva_cantidad = item_existente.cantidad + datos.cantidad
            if producto.existencia < nueva_cantidad:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stock insuficiente. Disponible: {producto.existencia}, en carrito: {item_existente.cantidad}, solicitado: {datos.cantidad}"
                )
            
            # Actualizar cantidad
            item_existente.cantidad = nueva_cantidad
            session.add(item_existente)
        else:
            # Crear nuevo item en el carrito
            nuevo_item = ItemCarrito(
                carrito_id=carrito.id,
                producto_id=datos.producto_id,
                cantidad=datos.cantidad
            )
            session.add(nuevo_item)
        
        session.commit()
        
        return MensajeResponse(
            mensaje=f"Producto '{producto.nombre}' agregado al carrito (cantidad: {datos.cantidad})"
        )


# Alias para compatibilidad con el frontend
@app.post("/carrito/agregar", response_model=MensajeResponse, status_code=status.HTTP_201_CREATED)
def agregar_al_carrito_alias(
    datos: AgregarCarritoRequest,
    usuario_actual: Usuario = Depends(get_current_user)
):
    """Alias de POST /carrito para agregar productos al carrito."""
    return agregar_al_carrito(datos, usuario_actual)


@app.put("/carrito/{producto_id}", response_model=CarritoResponse)
def actualizar_cantidad_carrito(
    producto_id: int,
    datos: ActualizarCarritoRequest,
    usuario_actual: Usuario = Depends(get_current_user)
):
    """Actualizar la cantidad de un producto en el carrito."""
    if datos.cantidad < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La cantidad no puede ser negativa"
        )

    with Session(engine) as session:
        carrito = session.exec(
            select(Carrito).where(
                Carrito.usuario_id == usuario_actual.id,
                Carrito.estado == "activo"
            )
        ).first()

        if not carrito:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No hay un carrito activo"
            )

        producto = session.get(Producto, producto_id)
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto con ID {producto_id} no encontrado"
            )

        item = session.exec(
            select(ItemCarrito).where(
                ItemCarrito.carrito_id == carrito.id,
                ItemCarrito.producto_id == producto_id
            )
        ).first()

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"El producto {producto.nombre} no está en el carrito"
            )

        if datos.cantidad == 0:
            session.delete(item)
        else:
            if datos.cantidad > producto.existencia:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stock insuficiente. Disponible: {producto.existencia}"
                )
            item.cantidad = datos.cantidad
            session.add(item)

        session.commit()

    return ver_carrito(usuario_actual)


@app.delete("/carrito/{producto_id}", response_model=MensajeResponse)
def quitar_del_carrito(
    producto_id: int,
    usuario_actual: Usuario = Depends(get_current_user)
):
    """
    Quitar un producto del carrito.
    
    - Elimina completamente el item del carrito
    - Error 404 si el producto no está en el carrito
    - Requiere autenticación
    """
    with Session(engine) as session:
        # Obtener carrito activo
        carrito = session.exec(
            select(Carrito).where(
                Carrito.usuario_id == usuario_actual.id,
                Carrito.estado == "activo"
            )
        ).first()
        
        if not carrito:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tienes un carrito activo"
            )
        
        # Buscar el item en el carrito
        item = session.exec(
            select(ItemCarrito).where(
                ItemCarrito.carrito_id == carrito.id,
                ItemCarrito.producto_id == producto_id
            )
        ).first()
        
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto con ID {producto_id} no está en tu carrito"
            )
        
        # Eliminar el item
        session.delete(item)
        session.commit()
        
        return MensajeResponse(
            mensaje=f"Producto eliminado del carrito"
        )


# Alias para compatibilidad con el frontend
@app.delete("/carrito/quitar/{producto_id}", response_model=MensajeResponse)
def quitar_del_carrito_alias(
    producto_id: int,
    usuario_actual: Usuario = Depends(get_current_user)
):
    """Alias de DELETE /carrito/{producto_id} para eliminar productos del carrito."""
    return quitar_del_carrito(producto_id, usuario_actual)


# Alias para compatibilidad - vaciar carrito
@app.delete("/carrito/vaciar", response_model=MensajeResponse)
def vaciar_carrito(usuario_actual: Usuario = Depends(get_current_user)):
    """Alias de POST /carrito/cancelar para vaciar el carrito."""
    return cancelar_carrito(usuario_actual)


@app.post("/carrito/cancelar", response_model=MensajeResponse)
def cancelar_carrito(usuario_actual: Usuario = Depends(get_current_user)):
    """
    Cancelar el carrito actual (vaciar carrito).
    
    - Cambia el estado del carrito a "cancelado"
    - Los items del carrito se eliminan automáticamente por CASCADE
    - Error 404 si no hay carrito activo
    - Requiere autenticación
    """
    with Session(engine) as session:
        # Obtener carrito activo
        carrito = session.exec(
            select(Carrito).where(
                Carrito.usuario_id == usuario_actual.id,
                Carrito.estado == "activo"
            )
        ).first()
        
        if not carrito:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tienes un carrito activo para cancelar"
            )
        
        # Cambiar estado a cancelado
        carrito.estado = "cancelado"
        session.add(carrito)
        session.commit()
        
        return MensajeResponse(
            mensaje="Carrito cancelado exitosamente"
        )


@app.post("/carrito/finalizar", response_model=CompraResponse)
def finalizar_compra(
    datos: FinalizarCompraRequest,
    usuario_actual: Usuario = Depends(get_current_user)
):
    """
    Finalizar compra del carrito activo.
    
    Lógica de negocio:
    - Calcula IVA: 21% para productos generales, 10% para categoría "Electrónica"
    - Calcula envío: Gratis si subtotal > $1000, sino $50
    - Crea registro de Compra con items
    - Actualiza stock de productos (disminuye existencia)
    - Cambia estado del carrito a "finalizado"
    - Requiere autenticación
    - Error 404 si no hay carrito activo
    - Error 400 si el carrito está vacío
    - Error 400 si no hay stock suficiente
    """
    with Session(engine) as session:
        # Obtener carrito activo con items
        carrito = session.exec(
            select(Carrito).where(
                Carrito.usuario_id == usuario_actual.id,
                Carrito.estado == "activo"
            )
        ).first()
        
        if not carrito:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tienes un carrito activo"
            )
        
        # Obtener items del carrito con productos
        items_carrito = session.exec(
            select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)
        ).all()
        
        if not items_carrito:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El carrito está vacío"
            )
        
        # Calcular subtotal y validar stock
        subtotal = 0.0
        items_compra_data = []
        
        for item in items_carrito:
            # Obtener producto
            producto = session.get(Producto, item.producto_id)
            if not producto:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Producto {item.producto_id} no encontrado"
                )
            
            # Validar stock
            if producto.existencia < item.cantidad:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stock insuficiente para {producto.nombre}. Disponible: {producto.existencia}"
                )
            
            # Calcular subtotal del item
            item_subtotal = producto.precio * item.cantidad
            subtotal += item_subtotal
            
            # Guardar datos para crear ItemCompra después
            items_compra_data.append({
                "producto_id": producto.id,
                "nombre": producto.nombre,
                "cantidad": item.cantidad,
                "precio_unitario": producto.precio,
                "subtotal": item_subtotal,
                "categoria": producto.categoria
            })
        
        # Calcular IVA (21% general, 10% para Electrónica)
        iva_total = 0.0
        for item_data in items_compra_data:
            if item_data["categoria"] == "Electrónica":
                iva_total += item_data["subtotal"] * 0.10
            else:
                iva_total += item_data["subtotal"] * 0.21
        
        # Calcular envío (gratis si subtotal > 1000, sino $50)
        envio = 0.0 if subtotal > 1000 else 50.0
        
        # Calcular total final
        total = subtotal + iva_total + envio
        
        # Crear registro de Compra
        ultimos_cuatro = datos.tarjeta[-4:]

        compra = Compra(
            usuario_id=usuario_actual.id,
            direccion=datos.direccion,
            tarjeta=ultimos_cuatro,
            total=total,
            envio=envio
        )
        session.add(compra)
        session.commit()
        session.refresh(compra)
        
        # Crear ItemCompra para cada item del carrito
        for item_data in items_compra_data:
            item_compra = ItemCompra(
                compra_id=compra.id,
                producto_id=item_data["producto_id"],
                nombre=item_data["nombre"],
                cantidad=item_data["cantidad"],
                precio_unitario=item_data["precio_unitario"]
            )
            session.add(item_compra)
            
            # Actualizar stock del producto
            producto = session.get(Producto, item_data["producto_id"])
            producto.existencia -= item_data["cantidad"]
            session.add(producto)
        
        # Cambiar estado del carrito a "finalizado"
        carrito.estado = "finalizado"
        session.add(carrito)
        
        session.commit()
        
        return CompraResponse(
            compra_id=compra.id,
            subtotal=subtotal,
            iva=iva_total,
            envio=envio,
            total=total
        )


# ========================================
# ENDPOINTS DE HISTORIAL DE COMPRAS
# ========================================

@app.get("/compras", response_model=list[CompraResumenResponse])
def listar_compras(usuario_actual: Usuario = Depends(get_current_user)):
    """
    Listar todas las compras del usuario autenticado (resumen).
    
    Retorna:
    - Lista de compras con: id, fecha, total, envío, cantidad de items
    - Ordenadas por fecha descendente (más reciente primero)
    - Solo compras del usuario autenticado
    - Requiere autenticación
    """
    with Session(engine) as session:
        # Obtener todas las compras del usuario
        compras = session.exec(
            select(Compra).where(Compra.usuario_id == usuario_actual.id)
        ).all()
        
        # Construir respuesta con resumen
        compras_resumen = []
        for compra in compras:
            # Contar cantidad de items en la compra
            items_count = len(compra.items)
            
            compras_resumen.append(CompraResumenResponse(
                id=compra.id,
                fecha=compra.fecha.isoformat(),
                total=compra.total,
                envio=compra.envio,
                cantidad_items=items_count
            ))
        
        # Ordenar por fecha descendente (más recientes primero)
        compras_resumen.sort(key=lambda x: x.fecha, reverse=True)
        
        return compras_resumen


# Alias para compatibilidad con el frontend
@app.get("/compras/historial", response_model=list[CompraResumenResponse])
def listar_compras_historial(usuario_actual: Usuario = Depends(get_current_user)):
    """Alias de GET /compras para obtener el historial de compras."""
    return listar_compras(usuario_actual)


@app.get("/compras/{compra_id}", response_model=CompraDetalleResponse)
def obtener_detalle_compra(
    compra_id: int,
    usuario_actual: Usuario = Depends(get_current_user)
):
    """
    Obtener detalle completo de una compra específica.
    
    Retorna:
    - Información completa de la compra
    - Lista de items con productos, cantidades y precios
    - Subtotal, envío y total
    - Solo si la compra pertenece al usuario autenticado
    - Error 404 si la compra no existe
    - Error 403 si la compra no pertenece al usuario
    - Requiere autenticación
    """
    with Session(engine) as session:
        # Obtener la compra
        compra = session.get(Compra, compra_id)
        
        if not compra:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Compra con ID {compra_id} no encontrada"
            )
        
        # Validar que la compra pertenezca al usuario actual
        if compra.usuario_id != usuario_actual.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para ver esta compra"
            )
        
        # Construir lista de items con detalles
        items_response = []
        subtotal = 0.0
        
        for item in compra.items:
            item_subtotal = item.precio_unitario * item.cantidad
            subtotal += item_subtotal
            
            items_response.append(ItemCompraResponse(
                producto_id=item.producto_id,
                nombre=item.nombre,
                precio_unitario=item.precio_unitario,
                cantidad=item.cantidad,
                subtotal=item_subtotal
            ))
        
        return CompraDetalleResponse(
            id=compra.id,
            fecha=compra.fecha.isoformat(),
            direccion=compra.direccion,
            tarjeta=compra.tarjeta,
            items=items_response,
            subtotal=subtotal,
            envio=compra.envio,
            total=compra.total
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
