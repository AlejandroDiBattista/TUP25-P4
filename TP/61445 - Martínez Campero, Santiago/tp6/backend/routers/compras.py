"""Endpoints para gestión de compras."""

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlmodel import Session, select, and_
from datetime import datetime
from typing import Optional

from database import get_session
from models.compras import Compra, CompraCreate, CompraResponse, CompraDetailResponse, ItemCompra, ItemCompraResponse
from models.carrito import Carrito, ItemCarrito
from models.usuarios import Usuario
from models.productos import Producto
from utils import validate_token_from_header
from config import IVA_STANDARD, IVA_ELECTRONICA, SHIPPING_COST, SHIPPING_FREE_THRESHOLD, ELECTRONICS_CATEGORIES

router = APIRouter(prefix="/compras", tags=["compras"])


@router.post("/finalizar", response_model=CompraResponse)
def finalizar_compra(
    compra_data: CompraCreate,
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    """Finalizar compra desde el carrito activo."""
    
    # Validar el token
    usuario_id = validate_token_from_header(authorization)
    
    usuario = session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    # Obtener carrito activo
    carrito = session.exec(
        select(Carrito).where(
            and_(
                Carrito.usuario_id == usuario.id,
                Carrito.estado == "activo"
            )
        )
    ).first()
    
    if not carrito:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active cart found"
        )
    
    # Obtener items del carrito
    items = session.exec(
        select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)
    ).all()
    
    if not items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )
    
    # Calcular totales por categoría
    subtotal = 0.0
    iva_total = 0.0
    items_compra = []
    items_info = []  # Para guardar info del producto
    
    for item in items:
        producto = session.get(Producto, item.producto_id)
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.producto_id} not found"
            )
        
        # Verificar stock disponible
        if producto.existencia < item.cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente para {producto.nombre}. Disponible: {producto.existencia}, solicitado: {item.cantidad}"
            )
        
        precio_item = producto.precio * item.cantidad
        subtotal += precio_item
        
        # Aplicar IVA según categoría
        iva_rate = IVA_ELECTRONICA if producto.categoria in ELECTRONICS_CATEGORIES else IVA_STANDARD
        iva_item = precio_item * iva_rate
        iva_total += iva_item
        
        # Crear item de compra
        item_compra = ItemCompra(
            producto_id=producto.id,
            cantidad=item.cantidad,
            nombre_producto=producto.nombre,
            precio_unitario=producto.precio,
            imagen=producto.imagen,
            precio_total=precio_item
        )
        items_compra.append(item_compra)
        
        # Reducir el stock del producto
        producto.existencia -= item.cantidad
        session.add(producto)
        
        # Guardar info del producto para la respuesta
        items_info.append({
            "nombre": producto.nombre,
            "precio": producto.precio,
            "imagen": producto.imagen,
            "precio_item": precio_item
        })
    
    # Calcular envío
    envio = 0.0 if subtotal >= SHIPPING_FREE_THRESHOLD else SHIPPING_COST
    
    # Total final
    total = subtotal + iva_total + envio
    
    # Crear compra
    compra = Compra(
        usuario_id=usuario.id,
        direccion=compra_data.direccion,
        tarjeta=compra_data.tarjeta,
        subtotal=subtotal,
        iva=iva_total,
        envio=envio,
        total=total
    )
    
    session.add(compra)
    session.flush()  # Para obtener el ID
    
    # Asociar items
    for item_compra in items_compra:
        item_compra.compra_id = compra.id
        session.add(item_compra)
    
    # Marcar carrito como inactivo
    carrito.estado = "cancelado"
    carrito.fecha_cancelacion = datetime.utcnow()
    
    session.add(carrito)
    session.commit()
    session.refresh(compra)
    
    return compra


@router.get("", response_model=list[CompraResponse])
def obtener_compras(
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    """Obtener historial de compras del usuario."""
    
    # Validar el token
    usuario_id = validate_token_from_header(authorization)
    
    usuario = session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    compras = session.exec(
        select(Compra).where(Compra.usuario_id == usuario.id).order_by(Compra.fecha.desc())
    ).all()
    
    # Cargar items para cada compra
    result = []
    for compra in compras:
        items_db = session.exec(
            select(ItemCompra).where(ItemCompra.compra_id == compra.id)
        ).all()
        
        # Construir items extendidos con información del producto
        items_extendidos = []
        for item in items_db:
            item_response = ItemCompraResponse(
                id=item.id,
                producto_id=item.producto_id,
                nombre=item.nombre_producto,
                cantidad=item.cantidad,
                precio_unitario=item.precio_unitario,
                precio_total=item.precio_total,
                imagen=item.imagen
            )
            items_extendidos.append(item_response)
        
        compra_response = CompraResponse(
            id=compra.id,
            usuario_id=compra.usuario_id,
            fecha=compra.fecha,
            direccion=compra.direccion,
            tarjeta=compra.tarjeta,
            subtotal=compra.subtotal,
            iva=compra.iva,
            envio=compra.envio,
            total=compra.total,
            estado=compra.estado,
            items=items_extendidos
        )
        result.append(compra_response)
    
    return result


@router.get("/{compra_id}", response_model=CompraDetailResponse)
def obtener_compra(
    compra_id: int,
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    """Obtener detalles de una compra específica."""
    
    # Validar el token
    usuario_id = validate_token_from_header(authorization)
    
    usuario = session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    compra = session.get(Compra, compra_id)
    
    if not compra:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase not found"
        )
    
    # Verificar que la compra pertenece al usuario
    if compra.usuario_id != usuario.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this purchase"
        )
    
    # Obtener items con información del producto
    items_db = session.exec(
        select(ItemCompra).where(ItemCompra.compra_id == compra.id)
    ).all()
    
    items_extendidos = []
    for item in items_db:
        item_response = ItemCompraResponse(
            id=item.id,
            producto_id=item.producto_id,
            nombre=item.nombre_producto,
            cantidad=item.cantidad,
            precio_unitario=item.precio_unitario,
            precio_total=item.precio_total,
            imagen=item.imagen
        )
        items_extendidos.append(item_response)
    
    return CompraDetailResponse(
        id=compra.id,
        usuario_id=compra.usuario_id,
        fecha=compra.fecha,
        direccion=compra.direccion,
        tarjeta=compra.tarjeta,
        subtotal=compra.subtotal,
        iva=compra.iva,
        envio=compra.envio,
        total=compra.total,
        estado=compra.estado,
        items=items_extendidos
    )
