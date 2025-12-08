from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from enum import Enum

class EstadoPedido(str, Enum):
    """Estados posibles de un pedido"""
    PENDIENTE = "pendiente"
    CONFIRMADO = "confirmado"
    PREPARANDO = "preparando"
    ENVIADO = "enviado"
    ENTREGADO = "entregado"
    CANCELADO = "cancelado"

class MetodoPago(str, Enum):
    """Métodos de pago disponibles"""
    TARJETA_CREDITO = "tarjeta_credito"
    TARJETA_DEBITO = "tarjeta_debito"
    TRANSFERENCIA = "transferencia"
    EFECTIVO = "efectivo"
    MERCADO_PAGO = "mercado_pago"

class Pedido(SQLModel, table=True):
    """Modelo de Pedido/Orden"""
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    numero_pedido: str = Field(unique=True, index=True)
    
    # Información de entrega
    direccion_entrega: str = Field(max_length=500)
    ciudad: str = Field(max_length=100)
    codigo_postal: str = Field(max_length=20)
    telefono_contacto: str = Field(max_length=20)
    
    # Información de pago
    metodo_pago: MetodoPago
    subtotal: float = Field(ge=0)
    impuestos: float = Field(ge=0)
    costo_envio: float = Field(ge=0)
    descuento: float = Field(ge=0, default=0)
    total: float = Field(ge=0)
    
    # Estado y fechas
    estado: EstadoPedido = Field(default=EstadoPedido.PENDIENTE)
    fecha_pedido: datetime = Field(default_factory=datetime.now)
    fecha_estimada_entrega: Optional[datetime] = None
    fecha_entrega: Optional[datetime] = None
    
    # Información adicional
    notas: Optional[str] = Field(default=None, max_length=1000)
    numero_seguimiento: Optional[str] = Field(default=None, max_length=100)
    
    # Relaciones
    items: List["PedidoItem"] = Relationship(back_populates="pedido")

class PedidoItem(SQLModel, table=True):
    """Modelo de Item del Pedido"""
    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id")
    producto_id: int = Field(foreign_key="producto.id")
    
    # Información del producto al momento del pedido
    nombre_producto: str = Field(max_length=200)
    precio_unitario: float = Field(ge=0)
    cantidad: int = Field(ge=1)
    subtotal: float = Field(ge=0)
    
    # Imagen para el historial
    imagen_producto: Optional[str] = Field(default=None, max_length=500)
    
    # Relaciones
    pedido: Optional[Pedido] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship()

# ===============================================
# MODELOS PARA REQUEST/RESPONSE DE API
# ===============================================

class DireccionEntrega(SQLModel):
    """Modelo para dirección de entrega"""
    direccion: str = Field(min_length=10, max_length=500)
    ciudad: str = Field(min_length=2, max_length=100)
    codigo_postal: str = Field(min_length=4, max_length=20)
    telefono: str = Field(min_length=10, max_length=20)

class InfoPago(SQLModel):
    """Modelo para información de pago"""
    metodo_pago: MetodoPago
    numero_tarjeta: Optional[str] = Field(default=None, max_length=20)  # Solo para simulación
    nombre_titular: Optional[str] = Field(default=None, max_length=100)

class CrearPedidoRequest(SQLModel):
    """Modelo para crear un nuevo pedido"""
    direccion_entrega: DireccionEntrega
    info_pago: InfoPago
    notas: Optional[str] = Field(default=None, max_length=1000)

class PedidoItemPublico(SQLModel):
    """Modelo público para items del pedido"""
    id: int
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float
    imagen_producto: Optional[str] = None

class PedidoPublico(SQLModel):
    """Modelo público para respuesta de pedidos"""
    id: int
    numero_pedido: str
    usuario_id: int
    
    # Información de entrega
    direccion_entrega: str
    ciudad: str
    codigo_postal: str
    telefono_contacto: str
    
    # Información de pago y costos
    metodo_pago: MetodoPago
    subtotal: float
    impuestos: float
    costo_envio: float
    descuento: float
    total: float
    
    # Estado y fechas
    estado: EstadoPedido
    fecha_pedido: datetime
    fecha_estimada_entrega: Optional[datetime] = None
    fecha_entrega: Optional[datetime] = None
    
    # Información adicional
    notas: Optional[str] = None
    numero_seguimiento: Optional[str] = None
    
    # Items del pedido
    items: List[PedidoItemPublico]

class ActualizarEstadoPedido(SQLModel):
    """Modelo para actualizar estado de pedido"""
    estado: EstadoPedido
    numero_seguimiento: Optional[str] = None
    fecha_estimada_entrega: Optional[datetime] = None

class ResumenPedido(SQLModel):
    """Modelo para resumen de costos del pedido"""
    subtotal: float
    impuestos: float
    costo_envio: float
    descuento: float
    total: float
    cantidad_items: int