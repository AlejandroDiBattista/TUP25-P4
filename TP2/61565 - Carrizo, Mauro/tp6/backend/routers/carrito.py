from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_session
from models import Usuario, Producto, Carrito, ItemCarrito, EstadoCarrito
from schemas import CarritoResponse, ItemCarritoAdd, FinalizarCompra, CompraResponse
from auth import get_current_user
from routers.compras import calcular_iva, calcular_envio, crear_compra

router = APIRouter()

def obtener_carrito_activo(usuario_id: int, session: Session) -> Carrito | None:
    """Obtener carrito activo del usuario"""
    statement = select(Carrito).where(
        Carrito.usuario_id == usuario_id,
        Carrito.estado == EstadoCarrito.ACTIVO
    )
    return session.exec(statement).first()

def crear_carrito_activo(usuario_id: int, session: Session) -> Carrito:
    """Crear un nuevo carrito activo"""
    carrito = Carrito(usuario_id=usuario_id, estado=EstadoCarrito.ACTIVO)
    session.add(carrito)
    session.commit()
    session.refresh(carrito)
    return carrito

@router.get("/carrito", response_model=CarritoResponse)
async def ver_carrito(
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Ver contenido del carrito"""
    carrito = obtener_carrito_activo(current_user.id, session)
    if not carrito:
        # Crear carrito vacío si no existe
        carrito = crear_carrito_activo(current_user.id, session)
    return carrito

@router.post("/carrito", response_model=CarritoResponse)
async def agregar_producto_carrito(
    item: ItemCarritoAdd,
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Agregar producto al carrito"""
    # Verificar que el producto existe y tiene existencia
    producto = session.get(Producto, item.producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    if producto.existencia < item.cantidad:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No hay suficiente existencia. Disponible: {producto.existencia}"
        )
    
    # Obtener o crear carrito activo
    carrito = obtener_carrito_activo(current_user.id, session)
    if not carrito:
        carrito = crear_carrito_activo(current_user.id, session)
    
    # Verificar si el producto ya está en el carrito
    statement = select(ItemCarrito).where(
        ItemCarrito.carrito_id == carrito.id,
        ItemCarrito.producto_id == item.producto_id
    )
    item_existente = session.exec(statement).first()
    
    if item_existente:
        # Actualizar cantidad
        nueva_cantidad = item_existente.cantidad + item.cantidad
        if producto.existencia < nueva_cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No hay suficiente existencia. Disponible: {producto.existencia}"
            )
        item_existente.cantidad = nueva_cantidad
    else:
        # Crear nuevo item
        nuevo_item = ItemCarrito(
            carrito_id=carrito.id,
            producto_id=item.producto_id,
            cantidad=item.cantidad
        )
        session.add(nuevo_item)
    
    session.commit()
    session.refresh(carrito)
    return carrito

@router.delete("/carrito/{product_id}", response_model=CarritoResponse)
async def quitar_producto_carrito(
    product_id: int,
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Quitar producto del carrito"""
    carrito = obtener_carrito_activo(current_user.id, session)
    if not carrito:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Carrito no encontrado"
        )
    
    # Verificar que el carrito no esté finalizado
    if carrito.estado != EstadoCarrito.ACTIVO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pueden eliminar productos de un carrito finalizado o cancelado"
        )
    
    # Buscar item
    statement = select(ItemCarrito).where(
        ItemCarrito.carrito_id == carrito.id,
        ItemCarrito.producto_id == product_id
    )
    item = session.exec(statement).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado en el carrito"
        )
    
    session.delete(item)
    session.commit()
    session.refresh(carrito)
    return carrito

@router.post("/carrito/finalizar", response_model=CompraResponse)
async def finalizar_compra(
    datos: FinalizarCompra,
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Finalizar compra"""
    carrito = obtener_carrito_activo(current_user.id, session)
    if not carrito:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Carrito no encontrado"
        )
    
    # Verificar que el carrito tenga items
    if not carrito.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El carrito está vacío"
        )
    
    # Verificar existencias y calcular totales
    subtotal = 0.0
    for item in carrito.items:
        producto = session.get(Producto, item.producto_id)
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto {item.producto_id} no encontrado"
            )
        if producto.existencia < item.cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Producto {producto.nombre} no tiene suficiente existencia"
            )
        subtotal += producto.precio * item.cantidad
    
    # Calcular IVA y envío
    iva = calcular_iva(carrito.items, session)
    envio = calcular_envio(subtotal)
    total = subtotal + iva + envio
    
    # Crear compra
    compra = crear_compra(
        usuario_id=current_user.id,
        direccion=datos.direccion,
        tarjeta=datos.tarjeta,
        items_carrito=carrito.items,
        subtotal=subtotal,
        iva=iva,
        envio=envio,
        total=total,
        session=session
    )
    
    # Actualizar existencias y marcar carrito como finalizado
    for item in carrito.items:
        producto = session.get(Producto, item.producto_id)
        producto.existencia -= item.cantidad
    
    carrito.estado = EstadoCarrito.FINALIZADO
    session.commit()
    session.refresh(compra)
    
    return compra

@router.post("/carrito/cancelar", response_model=CarritoResponse)
async def cancelar_compra(
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Cancelar compra (vaciar carrito)"""
    carrito = obtener_carrito_activo(current_user.id, session)
    if not carrito:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Carrito no encontrado"
        )
    
    # Eliminar todos los items
    for item in carrito.items:
        session.delete(item)
    
    carrito.estado = EstadoCarrito.CANCELADO
    session.commit()
    session.refresh(carrito)
    
    return carrito

