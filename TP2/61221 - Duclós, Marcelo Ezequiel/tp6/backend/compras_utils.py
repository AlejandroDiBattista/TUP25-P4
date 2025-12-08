"""
Utilidades para el manejo de compras y finalización de carritos
"""
from decimal import Decimal, ROUND_HALF_UP
from typing import Tuple, List, Dict
from datetime import datetime
from sqlmodel import Session, select
from models import Carrito, ItemCarrito, Compra, ItemCompra, Producto, EstadoCarrito
from reglas_negocio import ReglasNegocio, aplicar_reglas_precio


def obtener_iva_por_categoria(categoria: str) -> Decimal:
    """
    Obtiene el porcentaje de IVA según la categoría del producto
    
    Args:
        categoria: Categoría del producto
        
    Returns:
        Porcentaje de IVA como Decimal
    """
    return ReglasNegocio.obtener_iva_categoria(categoria)


def calcular_iva_por_items(items_carrito: List, usar_precio_con_descuento: bool = False) -> Tuple[Decimal, Decimal]:
    """
    Calcula el IVA diferenciado por categoría para cada item del carrito
    
    Args:
        items_carrito: Lista de items del carrito con productos
        usar_precio_con_descuento: Si usar precio con descuento aplicado
        
    Returns:
        Tuple con (iva_total, subtotal_con_iva)
    """
    iva_total = Decimal('0')
    subtotal_sin_iva = Decimal('0')
    
    for item in items_carrito:
        producto = item.producto
        cantidad = item.cantidad
        
        # Usar precio con descuento si está disponible
        if usar_precio_con_descuento and hasattr(item, 'precio_con_descuento'):
            precio_unitario = item.precio_con_descuento
        else:
            precio_unitario = producto.precio
        
        # Subtotal del item
        subtotal_item = precio_unitario * cantidad
        subtotal_sin_iva += subtotal_item
        
        # IVA según categoría
        iva_porcentaje = obtener_iva_por_categoria(producto.categoria)
        iva_item = (subtotal_item * iva_porcentaje).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        iva_total += iva_item
    
    total = subtotal_sin_iva + iva_total
    return iva_total, total


def calcular_iva_y_total(subtotal: Decimal, categoria: str = None) -> Tuple[Decimal, Decimal]:
    """
    Calcula el IVA y total de una compra (función de compatibilidad)
    
    Args:
        subtotal: Subtotal sin IVA
        categoria: Categoría para determinar IVA (opcional, por defecto usa IVA general)
        
    Returns:
        Tuple con (iva, total)
    """
    if categoria:
        iva_porcentaje = obtener_iva_por_categoria(categoria)
    else:
        iva_porcentaje = Decimal('0.105')  # IVA general por defecto
    
    iva = (subtotal * iva_porcentaje).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    total = subtotal + iva
    
    return iva, total


def calcular_envio(subtotal: Decimal) -> Decimal:
    """
    Calcula el costo de envío usando reglas de negocio centralizadas
    
    Args:
        subtotal: Subtotal de la compra
        
    Returns:
        Costo de envío
    """
    if subtotal >= ReglasNegocio.MONTO_ENVIO_GRATIS:
        return Decimal('0')  # Envío gratis
    else:
        return ReglasNegocio.COSTO_ENVIO_STANDARD


def finalizar_compra(session: Session, carrito: Carrito, direccion: str = None, tarjeta: str = None) -> Compra:
    """
    Finaliza una compra convirtiendo el carrito en una compra
    
    Args:
        session: Sesión de base de datos
        carrito: Carrito a finalizar
        direccion: Dirección de entrega (opcional)
        tarjeta: Información de tarjeta (opcional)
        
    Returns:
        Compra creada
        
    Raises:
        ValueError: Si el carrito está vacío o no tiene stock suficiente
    """
    # Obtener items del carrito con productos
    items_carrito = session.exec(
        select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)
    ).all()
    
    if not items_carrito:
        raise ValueError("El carrito está vacío")
    
    # Verificar stock disponible
    for item in items_carrito:
        producto = session.get(Producto, item.producto_id)
        if not producto:
            raise ValueError(f"Producto {item.producto_id} no encontrado")
        
        if producto.existencia < item.cantidad:
            raise ValueError(
                f"Stock insuficiente para {producto.titulo}. "
                f"Disponible: {producto.existencia}, Solicitado: {item.cantidad}"
            )
    
    # Calcular subtotal y obtener productos para IVA diferenciado
    subtotal = Decimal('0')
    items_con_producto = []
    
    for item in items_carrito:
        producto = session.get(Producto, item.producto_id)
        subtotal += producto.precio * item.cantidad
        
        # Agregar producto al item para cálculo de IVA diferenciado
        item.producto = producto
        items_con_producto.append(item)

    # Contar total de productos para descuentos
    total_items = sum(item.cantidad for item in items_con_producto)
    
    # Aplicar reglas de precio: descuentos, envío
    breakdown_precios = aplicar_reglas_precio(subtotal, total_items)
    
    # Calcular IVA diferenciado sobre el subtotal con descuento
    subtotal_con_descuento = breakdown_precios['subtotal_con_descuento']
    
    # Calcular IVA sobre el subtotal con descuento aplicado
    # Crear una estructura temporal para calcular IVA con descuento
    items_con_descuento = []
    factor_descuento = subtotal_con_descuento / subtotal if subtotal > 0 else Decimal('1')
    
    for item in items_con_producto:
        # Crear objeto temporal con precio con descuento
        item_temp = type('ItemTemp', (), {
            'producto': item.producto,
            'cantidad': item.cantidad,
            'precio_con_descuento': item.producto.precio * factor_descuento
        })()
        items_con_descuento.append(item_temp)
    
    # Calcular IVA sobre precios con descuento
    iva_productos, _ = calcular_iva_por_items(items_con_descuento, True)
    
    # IVA del envío (si no es gratis)
    envio = breakdown_precios['envio']
    if envio > 0:
        iva_envio, _ = calcular_iva_y_total(envio, "general")
        iva_total = iva_productos + iva_envio
    else:
        iva_total = iva_productos
    
    # Total final
    total = subtotal_con_descuento + envio + iva_total    # Crear la compra
    compra = Compra(
        usuario_id=carrito.usuario_id,
        subtotal=subtotal,
        descuento=breakdown_precios['descuento'],
        envio=envio,
        iva=iva_total,
        total=total,
        fecha=datetime.utcnow(),
        direccion=direccion or "Av. Corrientes 1234, CABA, Argentina",
        tarjeta=tarjeta or "**** **** **** 1234"
    )
    session.add(compra)
    session.flush()  # Para obtener el ID de la compra
    
    # Crear items de compra y actualizar stock
    for item in items_carrito:
        producto = session.get(Producto, item.producto_id)
        
        # Crear item de compra
        item_compra = ItemCompra(
            compra_id=compra.id,
            producto_id=item.producto_id,
            cantidad=item.cantidad,
            nombre=producto.titulo,
            precio_unitario=producto.precio,
            categoria=producto.categoria
        )
        session.add(item_compra)
        
        # Actualizar stock del producto
        producto.existencia -= item.cantidad
    
    # Cambiar estado del carrito a FINALIZADO
    carrito.estado = EstadoCarrito.FINALIZADO
    carrito.fecha_actualizacion = datetime.utcnow()
    
    session.commit()
    
    return compra


def obtener_resumen_compra(session: Session, compra_id: int) -> dict:
    """
    Obtiene el resumen completo de una compra
    
    Args:
        session: Sesión de base de datos
        compra_id: ID de la compra
        
    Returns:
        Dict con toda la información de la compra
    """
    compra = session.get(Compra, compra_id)
    if not compra:
        raise ValueError("Compra no encontrada")
    
    # Obtener items de la compra
    items_compra = session.exec(
        select(ItemCompra).where(ItemCompra.compra_id == compra_id)
    ).all()
    
    # Construir respuesta con detalles de productos
    items_detalle = []
    for item in items_compra:
        producto = session.get(Producto, item.producto_id)
        items_detalle.append({
            "producto_id": item.producto_id,
            "nombre": producto.titulo,
            "cantidad": item.cantidad,
            "precio_unitario": float(item.precio_unitario),
            "subtotal": float(item.precio_unitario * item.cantidad),
            "categoria": producto.categoria
        })
    
    return {
        "id": compra.id,
        "fecha": compra.fecha.isoformat(),
        "fecha_compra": compra.fecha.isoformat(),
        "subtotal": float(compra.subtotal),
        "descuento": float(compra.descuento),
        "subtotal_con_descuento": float(compra.subtotal - compra.descuento),
        "envio": float(compra.envio),
        "envio_gratis": compra.envio == 0 and compra.subtotal >= ReglasNegocio.MONTO_ENVIO_GRATIS,
        "iva": float(compra.iva),
        "total": float(compra.total),
        "direccion": compra.direccion,
        "tarjeta": compra.tarjeta,
        "items": items_detalle,
        "total_items": sum(item.cantidad for item in items_compra),
        "porcentaje_descuento": float((compra.descuento / compra.subtotal * 100) if compra.subtotal > 0 else 0)
    }