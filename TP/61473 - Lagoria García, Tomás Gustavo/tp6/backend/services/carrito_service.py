"""
Servicio de lógica de negocio para el carrito de compras
"""
from sqlmodel import Session, select
from fastapi import HTTPException
from typing import Tuple
from datetime import datetime

from models import (
    Carrito, ItemCarrito, Producto, Usuario, EstadoCarrito,
    Compra, ItemCompra
)


def obtener_o_crear_carrito_activo(usuario: Usuario, session: Session) -> Carrito:
    """
    Obtiene el carrito activo del usuario o crea uno nuevo si no existe.
    
    Args:
        usuario: Usuario actual
        session: Sesión de base de datos
        
    Returns:
        Carrito activo del usuario
    """
    # Buscar carrito activo
    statement = select(Carrito).where(
        Carrito.usuario_id == usuario.id,
        Carrito.estado == EstadoCarrito.ACTIVO
    )
    carrito = session.exec(statement).first()
    
    # Si no existe, crear uno nuevo
    if not carrito:
        carrito = Carrito(
            usuario_id=usuario.id,
            estado=EstadoCarrito.ACTIVO
        )
        session.add(carrito)
        session.commit()
        session.refresh(carrito)
        # Asegurar que items está inicializado
        if not hasattr(carrito, 'items') or carrito.items is None:
            carrito.items = []
    
    return carrito


def validar_existencia_producto(producto: Producto, cantidad: int) -> None:
    """
    Valida que haya existencia suficiente del producto.
    
    Args:
        producto: Producto a validar
        cantidad: Cantidad solicitada
        
    Raises:
        HTTPException 400: Si no hay existencia o es insuficiente
    """
    if producto.existencia <= 0:
        raise HTTPException(
            status_code=400,
            detail=f"El producto '{producto.titulo}' está agotado"
        )
    
    if producto.existencia < cantidad:
        raise HTTPException(
            status_code=400,
            detail=f"Stock insuficiente. Disponible: {producto.existencia}"
        )


def calcular_totales_carrito(carrito: Carrito) -> Tuple[float, float, float, float]:
    """
    Calcula los totales del carrito: subtotal, IVA, envío y total.
    
    Reglas:
    - IVA: 21% general, 10% para productos electrónicos
    - Envío: Gratis si total > $1000, sino $50
    
    Args:
        carrito: Carrito con items cargados
        
    Returns:
        Tupla (subtotal, iva, envio, total)
    """
    subtotal = 0.0
    iva = 0.0
    
    for item in carrito.items:
        item_subtotal = item.producto.precio * item.cantidad
        subtotal += item_subtotal
        
        # Calcular IVA según tipo de producto
        if item.producto.es_electronico:
            iva += item_subtotal * 0.10  # 10% para electrónicos
        else:
            iva += item_subtotal * 0.21  # 21% general
    
    # Calcular envío
    envio = 0.0 if subtotal > 1000 else 50.0
    
    # Total final
    total = subtotal + iva + envio
    
    return subtotal, iva, envio, total


def validar_carrito_activo(carrito: Carrito) -> None:
    """
    Valida que el carrito esté en estado ACTIVO.
    
    Args:
        carrito: Carrito a validar
        
    Raises:
        HTTPException 400: Si el carrito no está activo
    """
    if carrito.estado != EstadoCarrito.ACTIVO:
        raise HTTPException(
            status_code=400,
            detail="No se puede modificar un carrito finalizado o cancelado"
        )


def validar_carrito_no_vacio(carrito: Carrito) -> None:
    """
    Valida que el carrito tenga al menos un producto.
    
    Args:
        carrito: Carrito a validar
        
    Raises:
        HTTPException 400: Si el carrito está vacío
    """
    if not carrito.items or len(carrito.items) == 0:
        raise HTTPException(
            status_code=400,
            detail="El carrito está vacío. Agrega productos antes de finalizar"
        )


def crear_compra_desde_carrito(
    carrito: Carrito,
    direccion: str,
    tarjeta: str,
    session: Session
) -> Compra:
    """
    Crea un registro de Compra a partir del carrito actual.
    
    - Crea ItemCompra con snapshot de datos (nombre, precio)
    - Descuenta el stock de cada producto
    - Cambia el estado del carrito a FINALIZADO
    - Enmascarada la tarjeta de crédito
    
    Args:
        carrito: Carrito con los productos a comprar
        direccion: Dirección de envío
        tarjeta: Número de tarjeta (se enmascarará)
        session: Sesión de base de datos
        
    Returns:
        Compra creada
        
    Raises:
        HTTPException 400: Si algún producto no tiene stock suficiente
    """
    from utils.security import enmascarar_tarjeta
    
    # Calcular totales
    subtotal, iva, envio, total = calcular_totales_carrito(carrito)
    
    # Validar existencia de todos los productos antes de procesar
    for item in carrito.items:
        validar_existencia_producto(item.producto, item.cantidad)
    
    # Crear la compra
    compra = Compra(
        usuario_id=carrito.usuario_id,
        fecha=datetime.now(),
        direccion=direccion,
        tarjeta=enmascarar_tarjeta(tarjeta),
        subtotal=subtotal,
        iva=iva,
        envio=envio,
        total=total
    )
    session.add(compra)
    session.flush()  # Para obtener el ID de la compra
    
    # Crear items de compra y descontar stock
    for item in carrito.items:
        # Crear snapshot del item
        item_compra = ItemCompra(
            compra_id=compra.id,
            producto_id=item.producto_id,
            cantidad=item.cantidad,
            nombre=item.producto.titulo,
            precio_unitario=item.producto.precio,
            categoria=item.producto.categoria,
            imagen=item.producto.imagen
        )
        session.add(item_compra)
        
        # Descontar stock
        item.producto.existencia -= item.cantidad
        session.add(item.producto)
        
        # Eliminar item del carrito
        session.delete(item)
    
    # Cambiar estado del carrito a FINALIZADO
    carrito.estado = EstadoCarrito.FINALIZADO
    session.add(carrito)
    
    session.commit()
    session.refresh(compra)
    
    return compra

