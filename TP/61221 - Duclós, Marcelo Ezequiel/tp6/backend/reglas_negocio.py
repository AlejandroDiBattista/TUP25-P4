"""
Configuración de reglas de negocio del sistema de e-commerce
"""
from decimal import Decimal
from typing import Dict

class ReglasNegocio:
    """Configuración centralizada de reglas de negocio"""
    
    # Límites de carrito
    CANTIDAD_MAXIMA_POR_PRODUCTO = 10
    CANTIDAD_MAXIMA_TOTAL_CARRITO = 50
    
    # Configuración de envío
    MONTO_ENVIO_GRATIS = Decimal('1500')  # $1500
    COSTO_ENVIO_STANDARD = Decimal('200')  # $200
    
    # IVA por categoría
    IVA_ELECTRONICA = Decimal('0.21')      # 21%
    IVA_GENERAL = Decimal('0.105')         # 10.5%
    
    # Categorías que tienen IVA del 21%
    CATEGORIAS_IVA_ALTO = {
        'electrónicos', 
        'electronics', 
        'tecnología',
        'computadoras',
        'celulares',
        'audio',
        'video'
    }
    
    # Descuentos por cantidad
    DESCUENTO_POR_CANTIDAD = {
        5: Decimal('0.05'),   # 5% descuento por 5+ productos
        10: Decimal('0.10'),  # 10% descuento por 10+ productos
        20: Decimal('0.15')   # 15% descuento por 20+ productos
    }
    
    # Límites de stock crítico
    STOCK_CRITICO = 5
    STOCK_MINIMO = 1
    
    @classmethod
    def obtener_iva_categoria(cls, categoria: str) -> Decimal:
        """Obtiene el porcentaje de IVA según la categoría"""
        if categoria.lower() in cls.CATEGORIAS_IVA_ALTO:
            return cls.IVA_ELECTRONICA
        return cls.IVA_GENERAL
    
    @classmethod
    def calcular_descuento_cantidad(cls, total_items: int) -> Decimal:
        """Calcula descuento por cantidad de productos"""
        descuento = Decimal('0')
        
        for cantidad_minima in sorted(cls.DESCUENTO_POR_CANTIDAD.keys(), reverse=True):
            if total_items >= cantidad_minima:
                descuento = cls.DESCUENTO_POR_CANTIDAD[cantidad_minima]
                break
        
        return descuento
    
    @classmethod
    def es_stock_critico(cls, existencia: int) -> bool:
        """Verifica si un producto tiene stock crítico"""
        return existencia <= cls.STOCK_CRITICO
    
    @classmethod
    def producto_disponible(cls, existencia: int) -> bool:
        """Verifica si un producto está disponible para venta"""
        return existencia >= cls.STOCK_MINIMO


def aplicar_reglas_precio(subtotal: Decimal, total_items: int, 
                         aplicar_descuentos: bool = True) -> Dict[str, Decimal]:
    """
    Aplica todas las reglas de precio: descuentos, envío, etc.
    
    Args:
        subtotal: Subtotal base de la compra
        total_items: Cantidad total de productos
        aplicar_descuentos: Si aplicar descuentos por cantidad
        
    Returns:
        Dict con breakdown de precios
    """
    resultado = {
        'subtotal_original': subtotal,
        'descuento': Decimal('0'),
        'subtotal_con_descuento': subtotal,
        'envio': Decimal('0'),
        'es_envio_gratis': False
    }
    
    # Aplicar descuento por cantidad
    if aplicar_descuentos and total_items > 0:
        porcentaje_descuento = ReglasNegocio.calcular_descuento_cantidad(total_items)
        if porcentaje_descuento > 0:
            resultado['descuento'] = (subtotal * porcentaje_descuento).quantize(Decimal('0.01'))
            resultado['subtotal_con_descuento'] = subtotal - resultado['descuento']
    
    # Calcular envío
    subtotal_final = resultado['subtotal_con_descuento']
    if subtotal_final >= ReglasNegocio.MONTO_ENVIO_GRATIS:
        resultado['envio'] = Decimal('0')
        resultado['es_envio_gratis'] = True
    else:
        resultado['envio'] = ReglasNegocio.COSTO_ENVIO_STANDARD
        resultado['es_envio_gratis'] = False
    
    return resultado


def validar_disponibilidad_producto(existencia: int, cantidad_solicitada: int, 
                                  titulo_producto: str = "") -> bool:
    """
    Valida si un producto está disponible para la cantidad solicitada
    
    Args:
        existencia: Stock disponible
        cantidad_solicitada: Cantidad que se quiere comprar
        titulo_producto: Título del producto (para mensajes de error)
        
    Returns:
        True si está disponible
        
    Raises:
        ValueError: Si no está disponible con mensaje descriptivo
    """
    if not ReglasNegocio.producto_disponible(existencia):
        raise ValueError(f"Producto '{titulo_producto}' no disponible (sin stock)")
    
    if existencia < cantidad_solicitada:
        raise ValueError(
            f"Stock insuficiente para '{titulo_producto}'. "
            f"Disponible: {existencia}, Solicitado: {cantidad_solicitada}"
        )
    
    if ReglasNegocio.es_stock_critico(existencia):
        # Log o notificación de stock crítico (implementar según necesidad)
        pass
    
    return True