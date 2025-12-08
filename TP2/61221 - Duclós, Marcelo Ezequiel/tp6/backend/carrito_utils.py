"""Utilidades para gestión del carrito de compras"""

from datetime import datetime
from typing import Optional
from fastapi import HTTPException, status
from sqlmodel import Session, select
from decimal import Decimal

# Importar reglas de negocio centralizadas
from reglas_negocio import ReglasNegocio

from models import (
    Carrito, ItemCarrito, Producto, Usuario, EstadoCarrito,
    ItemCarritoCreate, ItemCarritoUpdate, CarritoResponse, ItemCarritoResponse,
    ProductoResponse
)

def obtener_carrito_activo(session: Session, usuario_id: int) -> Optional[Carrito]:
    """Obtener el carrito activo del usuario"""
    statement = select(Carrito).where(
        Carrito.usuario_id == usuario_id,
        Carrito.estado == EstadoCarrito.ACTIVO
    )
    return session.exec(statement).first()

def crear_carrito(session: Session, usuario_id: int) -> Carrito:
    """Crear un nuevo carrito para el usuario"""
    carrito = Carrito(
        usuario_id=usuario_id,
        estado=EstadoCarrito.ACTIVO,
        fecha_creacion=datetime.now(),
        fecha_actualizacion=datetime.now()
    )
    session.add(carrito)
    session.commit()
    session.refresh(carrito)
    return carrito

def obtener_o_crear_carrito(session: Session, usuario_id: int) -> Carrito:
    """Obtener carrito activo o crear uno nuevo si no existe"""
    carrito = obtener_carrito_activo(session, usuario_id)
    if not carrito:
        carrito = crear_carrito(session, usuario_id)
    return carrito

def verificar_disponibilidad_producto(session: Session, producto_id: int, cantidad: int) -> Producto:
    """Verificar que el producto existe y tiene stock suficiente"""
    statement = select(Producto).where(Producto.id == producto_id)
    producto = session.exec(statement).first()
    
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {producto_id} no encontrado"
        )
    
    if producto.existencia < cantidad:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stock insuficiente. Disponible: {producto.existencia}, Solicitado: {cantidad}"
        )
    
    return producto


def validar_limite_total_carrito(session: Session, carrito: Carrito, cantidad_adicional: int = 0):
    """Validar que el carrito no exceda el límite total de productos"""
    # Contar total de productos en el carrito
    total_items = session.exec(
        select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)
    ).all()
    
    total_cantidad = sum(item.cantidad for item in total_items) + cantidad_adicional
    
    if total_cantidad > ReglasNegocio.CANTIDAD_MAXIMA_TOTAL_CARRITO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El carrito no puede tener más de {ReglasNegocio.CANTIDAD_MAXIMA_TOTAL_CARRITO} productos en total"
        )


def agregar_item_a_carrito(
    session: Session, 
    carrito: Carrito, 
    item_data: ItemCarritoCreate
) -> ItemCarrito:
    """Agregar un item al carrito o actualizar cantidad si ya existe con validaciones de negocio"""
    
    # Validar cantidad solicitada
    if item_data.cantidad <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La cantidad debe ser mayor a 0"
        )
    
    if item_data.cantidad > ReglasNegocio.CANTIDAD_MAXIMA_POR_PRODUCTO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se pueden agregar más de {ReglasNegocio.CANTIDAD_MAXIMA_POR_PRODUCTO} unidades de un producto"
        )
    
    # Verificar producto y disponibilidad
    producto = verificar_disponibilidad_producto(
        session, item_data.producto_id, item_data.cantidad
    )
    
    # Verificar si el item ya existe en el carrito
    statement = select(ItemCarrito).where(
        ItemCarrito.carrito_id == carrito.id,
        ItemCarrito.producto_id == item_data.producto_id
    )
    item_existente = session.exec(statement).first()
    
    if item_existente:
        # Actualizar cantidad
        nueva_cantidad = item_existente.cantidad + item_data.cantidad
        
        # Validar límites por producto
        if nueva_cantidad > ReglasNegocio.CANTIDAD_MAXIMA_POR_PRODUCTO:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No se pueden tener más de {ReglasNegocio.CANTIDAD_MAXIMA_POR_PRODUCTO} unidades del mismo producto en el carrito"
            )
        
        # Verificar stock para la nueva cantidad
        verificar_disponibilidad_producto(session, item_data.producto_id, nueva_cantidad)
        
        item_existente.cantidad = nueva_cantidad
        item_existente.fecha_agregado = datetime.now()
        item = item_existente
    else:
        # Validar límite total del carrito
        validar_limite_total_carrito(session, carrito, item_data.cantidad)
        
        # Crear nuevo item
        item = ItemCarrito(
            carrito_id=carrito.id,
            producto_id=item_data.producto_id,
            cantidad=item_data.cantidad,
            fecha_agregado=datetime.now()
        )
        session.add(item)
    
    # Actualizar fecha de modificación del carrito
    carrito.fecha_actualizacion = datetime.now()
    
    session.commit()
    session.refresh(item)
    return item

def actualizar_cantidad_item(
    session: Session,
    carrito: Carrito,
    producto_id: int,
    nueva_cantidad: int
) -> ItemCarrito:
    """Actualizar la cantidad de un item en el carrito"""
    
    # Buscar el item en el carrito
    statement = select(ItemCarrito).where(
        ItemCarrito.carrito_id == carrito.id,
        ItemCarrito.producto_id == producto_id
    )
    item = session.exec(statement).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado en el carrito"
        )
    
    # Verificar disponibilidad
    verificar_disponibilidad_producto(session, producto_id, nueva_cantidad)
    
    # Actualizar cantidad
    item.cantidad = nueva_cantidad
    carrito.fecha_actualizacion = datetime.now()
    
    session.commit()
    session.refresh(item)
    return item

def eliminar_item_de_carrito(session: Session, carrito: Carrito, producto_id: int):
    """Eliminar un item del carrito"""
    
    # Buscar el item
    statement = select(ItemCarrito).where(
        ItemCarrito.carrito_id == carrito.id,
        ItemCarrito.producto_id == producto_id
    )
    item = session.exec(statement).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado en el carrito"
        )
    
    # Eliminar item
    session.delete(item)
    carrito.fecha_actualizacion = datetime.now()
    session.commit()

def vaciar_carrito(session: Session, carrito: Carrito):
    """Vaciar todos los items del carrito"""
    statement = select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)
    items = session.exec(statement).all()
    
    for item in items:
        session.delete(item)
    
    carrito.fecha_actualizacion = datetime.now()
    session.commit()

def convertir_carrito_a_response(carrito: Carrito, session: Session) -> CarritoResponse:
    """Convertir carrito a CarritoResponse con items completos"""
    
    # Cargar items del carrito
    statement = select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)
    items = session.exec(statement).all()
    
    # Convertir items a response
    items_response = []
    for item in items:
        # Cargar producto
        producto_statement = select(Producto).where(Producto.id == item.producto_id)
        producto = session.exec(producto_statement).first()
        
        if producto:
            producto_dict = producto.model_dump()
            producto_dict["disponible"] = producto.disponible
            producto_response = ProductoResponse(**producto_dict)
            
            item_response = ItemCarritoResponse(
                id=item.id,
                producto_id=item.producto_id,
                cantidad=item.cantidad,
                subtotal=item.subtotal,
                fecha_agregado=item.fecha_agregado,
                producto=producto_response
            )
            items_response.append(item_response)
    
    return CarritoResponse(
        id=carrito.id,
        estado=carrito.estado,
        fecha_creacion=carrito.fecha_creacion,
        fecha_actualizacion=carrito.fecha_actualizacion,
        total_items=carrito.total_items,
        subtotal=carrito.subtotal,
        items=items_response
    )