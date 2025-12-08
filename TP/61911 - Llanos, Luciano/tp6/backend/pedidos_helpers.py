from fastapi import HTTPException
from sqlmodel import Session, select
from typing import List
from datetime import datetime, timedelta
import uuid
import random

from models.pedidos import (
    Pedido, PedidoItem, EstadoPedido, MetodoPago,
    PedidoPublico, PedidoItemPublico, ResumenPedido,
    CrearPedidoRequest, DireccionEntrega, InfoPago
)
from models.carrito import Carrito, CarritoItem
from models.productos import Producto
from models.usuarios import Usuario
from carrito_helpers import obtener_carrito_usuario

def generar_numero_pedido() -> str:
    """Generar número único de pedido"""
    timestamp = datetime.now().strftime("%Y%m%d")
    random_part = str(random.randint(1000, 9999))
    return f"PED-{timestamp}-{random_part}"

def calcular_costos_pedido(items: List[CarritoItem]) -> ResumenPedido:
    """Calcular costos del pedido"""
    subtotal = sum(item.cantidad * item.precio_unitario for item in items)
    
    # Simulación de cálculos
    impuestos = round(subtotal * 0.21, 2)  # IVA 21%
    
    # Costo de envío basado en subtotal
    if subtotal >= 50000:  # Envío gratis para compras mayores
        costo_envio = 0.0
    elif subtotal >= 25000:
        costo_envio = 5000.0  # Envío reducido
    else:
        costo_envio = 8500.0  # Envío estándar
    
    # Descuentos (simulación - podría ser por cupones)
    descuento = 0.0
    if subtotal >= 100000:  # Descuento por volumen
        descuento = round(subtotal * 0.05, 2)  # 5% descuento
    
    total = subtotal + impuestos + costo_envio - descuento
    
    return ResumenPedido(
        subtotal=round(subtotal, 2),
        impuestos=impuestos,
        costo_envio=costo_envio,
        descuento=descuento,
        total=round(total, 2),
        cantidad_items=sum(item.cantidad for item in items)
    )

def validar_carrito_para_checkout(usuario_id: int, session: Session) -> List[CarritoItem]:
    """Validar que el carrito esté listo para checkout"""
    carrito = obtener_carrito_usuario(usuario_id, session)
    
    items = session.exec(
        select(CarritoItem).where(CarritoItem.carrito_id == carrito.id)
    ).all()
    
    if not items:
        raise HTTPException(
            status_code=400,
            detail="El carrito está vacío. Agregue productos antes de proceder."
        )
    
    # Validar stock de todos los productos
    for item in items:
        producto = session.get(Producto, item.producto_id)
        if not producto:
            raise HTTPException(
                status_code=400,
                detail=f"Producto {item.producto_id} no encontrado"
            )
        
        if producto.existencia < item.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para {producto.titulo}. "
                       f"Disponible: {producto.existencia}, Solicitado: {item.cantidad}"
            )
    
    return items

def procesar_pago_simulado(info_pago: InfoPago, total: float) -> bool:
    """Simular procesamiento de pago"""
    # Simulación de validaciones de pago
    if info_pago.metodo_pago == MetodoPago.TARJETA_CREDITO:
        if not info_pago.numero_tarjeta or len(info_pago.numero_tarjeta) < 16:
            raise HTTPException(
                status_code=400,
                detail="Número de tarjeta inválido"
            )
        if not info_pago.nombre_titular:
            raise HTTPException(
                status_code=400,
                detail="Nombre del titular requerido"
            )
    
    # Simular posible falla de pago (5% de probabilidad)
    if random.random() < 0.05:
        raise HTTPException(
            status_code=400,
            detail="Error en el procesamiento del pago. Intente nuevamente."
        )
    
    return True

def crear_pedido_desde_carrito(
    usuario_id: int,
    pedido_data: CrearPedidoRequest,
    session: Session
) -> Pedido:
    """Crear pedido a partir del carrito actual"""
    
    # Validar carrito
    items_carrito = validar_carrito_para_checkout(usuario_id, session)
    
    # Calcular costos
    costos = calcular_costos_pedido(items_carrito)
    
    # Procesar pago
    procesar_pago_simulado(pedido_data.info_pago, costos.total)
    
    # Generar número de pedido
    numero_pedido = generar_numero_pedido()
    
    # Fecha estimada de entrega (3-7 días)
    dias_entrega = random.randint(3, 7)
    fecha_estimada = datetime.now() + timedelta(days=dias_entrega)
    
    # Crear pedido
    pedido = Pedido(
        usuario_id=usuario_id,
        numero_pedido=numero_pedido,
        direccion_entrega=pedido_data.direccion_entrega.direccion,
        ciudad=pedido_data.direccion_entrega.ciudad,
        codigo_postal=pedido_data.direccion_entrega.codigo_postal,
        telefono_contacto=pedido_data.direccion_entrega.telefono,
        metodo_pago=pedido_data.info_pago.metodo_pago,
        subtotal=costos.subtotal,
        impuestos=costos.impuestos,
        costo_envio=costos.costo_envio,
        descuento=costos.descuento,
        total=costos.total,
        estado=EstadoPedido.CONFIRMADO,
        fecha_estimada_entrega=fecha_estimada,
        notas=pedido_data.notas
    )
    
    session.add(pedido)
    session.flush()  # Para obtener el ID del pedido
    
    # Crear items del pedido
    for item_carrito in items_carrito:
        producto = session.get(Producto, item_carrito.producto_id)
        
        pedido_item = PedidoItem(
            pedido_id=pedido.id,
            producto_id=item_carrito.producto_id,
            nombre_producto=producto.titulo,
            precio_unitario=item_carrito.precio_unitario,
            cantidad=item_carrito.cantidad,
            subtotal=item_carrito.cantidad * item_carrito.precio_unitario,
            imagen_producto=producto.imagen
        )
        session.add(pedido_item)
        
        # Actualizar stock del producto
        producto.existencia -= item_carrito.cantidad
        session.add(producto)
    
    # Vaciar el carrito
    carrito = obtener_carrito_usuario(usuario_id, session)
    items_a_eliminar = session.exec(
        select(CarritoItem).where(CarritoItem.carrito_id == carrito.id)
    ).all()
    
    for item in items_a_eliminar:
        session.delete(item)
    
    session.commit()
    session.refresh(pedido)
    
    return pedido

def convertir_pedido_a_publico(pedido: Pedido, session: Session) -> PedidoPublico:
    """Convertir pedido a modelo público"""
    items_publicos = []
    
    for item in pedido.items:
        item_publico = PedidoItemPublico(
            id=item.id,
            producto_id=item.producto_id,
            nombre_producto=item.nombre_producto,
            precio_unitario=item.precio_unitario,
            cantidad=item.cantidad,
            subtotal=item.subtotal,
            imagen_producto=item.imagen_producto
        )
        items_publicos.append(item_publico)
    
    return PedidoPublico(
        id=pedido.id,
        numero_pedido=pedido.numero_pedido,
        usuario_id=pedido.usuario_id,
        direccion_entrega=pedido.direccion_entrega,
        ciudad=pedido.ciudad,
        codigo_postal=pedido.codigo_postal,
        telefono_contacto=pedido.telefono_contacto,
        metodo_pago=pedido.metodo_pago,
        subtotal=pedido.subtotal,
        impuestos=pedido.impuestos,
        costo_envio=pedido.costo_envio,
        descuento=pedido.descuento,
        total=pedido.total,
        estado=pedido.estado,
        fecha_pedido=pedido.fecha_pedido,
        fecha_estimada_entrega=pedido.fecha_estimada_entrega,
        fecha_entrega=pedido.fecha_entrega,
        notas=pedido.notas,
        numero_seguimiento=pedido.numero_seguimiento,
        items=items_publicos
    )

def obtener_pedidos_usuario(usuario_id: int, session: Session) -> List[Pedido]:
    """Obtener todos los pedidos de un usuario"""
    return session.exec(
        select(Pedido)
        .where(Pedido.usuario_id == usuario_id)
        .order_by(Pedido.fecha_pedido.desc())
    ).all()

def generar_numero_seguimiento() -> str:
    """Generar número de seguimiento"""
    return f"TRK{random.randint(100000, 999999)}"