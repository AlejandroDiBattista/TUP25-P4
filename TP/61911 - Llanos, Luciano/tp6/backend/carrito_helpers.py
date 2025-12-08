from fastapi import HTTPException
from sqlmodel import Session, select
from typing import Optional
from datetime import datetime

from models.carrito import Carrito, CarritoItem, CarritoPublico, CarritoItemPublico, CarritoResumen
from models.productos import Producto
from models.usuarios import Usuario

def obtener_carrito_usuario(usuario_id: int, session: Session) -> Optional[Carrito]:
    """Obtener carrito activo del usuario, crear uno si no existe"""
    carrito = session.exec(
        select(Carrito).where(
            Carrito.usuario_id == usuario_id,
            Carrito.activo == True
        )
    ).first()
    
    if not carrito:
        # Crear nuevo carrito para el usuario
        carrito = Carrito(usuario_id=usuario_id)
        session.add(carrito)
        session.commit()
        session.refresh(carrito)
    
    return carrito

def calcular_total_carrito(carrito_id: int, session: Session) -> CarritoResumen:
    """Calcular totales del carrito"""
    items = session.exec(
        select(CarritoItem).where(CarritoItem.carrito_id == carrito_id)
    ).all()
    
    total_items = sum(item.cantidad for item in items)
    total_precio = sum(item.cantidad * item.precio_unitario for item in items)
    cantidad_productos = len(items)
    
    return CarritoResumen(
        total_items=total_items,
        total_precio=round(total_precio, 2),
        cantidad_productos=cantidad_productos
    )

def convertir_carrito_a_publico(carrito: Carrito, session: Session) -> CarritoPublico:
    """Convertir carrito a modelo público con información completa"""
    items_publicos = []
    
    for item in carrito.items:
        producto = session.get(Producto, item.producto_id)
        if producto:
            item_publico = CarritoItemPublico(
                id=item.id,
                producto_id=item.producto_id,
                cantidad=item.cantidad,
                precio_unitario=item.precio_unitario,
                subtotal=round(item.cantidad * item.precio_unitario, 2),
                fecha_agregado=item.fecha_agregado,
                producto_nombre=producto.titulo,
                producto_imagen=producto.imagen
            )
            items_publicos.append(item_publico)
    
    resumen = calcular_total_carrito(carrito.id, session)
    
    return CarritoPublico(
        id=carrito.id,
        usuario_id=carrito.usuario_id,
        fecha_creacion=carrito.fecha_creacion,
        fecha_actualizacion=carrito.fecha_actualizacion,
        items=items_publicos,
        total_items=resumen.total_items,
        total_precio=resumen.total_precio
    )

def validar_stock_producto(producto_id: int, cantidad: int, session: Session) -> Producto:
    """Validar que el producto existe y hay stock suficiente"""
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    if producto.existencia < cantidad:
        raise HTTPException(
            status_code=400, 
            detail=f"Stock insuficiente. Disponible: {producto.existencia}"
        )
    
    return producto

def buscar_item_en_carrito(carrito_id: int, producto_id: int, session: Session) -> Optional[CarritoItem]:
    """Buscar si un producto ya está en el carrito"""
    return session.exec(
        select(CarritoItem).where(
            CarritoItem.carrito_id == carrito_id,
            CarritoItem.producto_id == producto_id
        )
    ).first()

def actualizar_fecha_carrito(carrito_id: int, session: Session):
    """Actualizar fecha de modificación del carrito"""
    carrito = session.get(Carrito, carrito_id)
    if carrito:
        carrito.fecha_actualizacion = datetime.now()
        session.add(carrito)
        session.commit()