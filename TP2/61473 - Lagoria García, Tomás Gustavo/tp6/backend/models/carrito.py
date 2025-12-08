"""
Modelos de Carrito y ItemCarrito para la base de datos.

Define la estructura del carrito de compras y sus items.
"""
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from enum import Enum

if TYPE_CHECKING:
    from .usuario import Usuario
    from .productos import Producto


class EstadoCarrito(str, Enum):
    """Estados posibles del carrito."""
    ACTIVO = "activo"
    FINALIZADO = "finalizado"
    CANCELADO = "cancelado"


class Carrito(SQLModel, table=True):
    """Modelo de Carrito de compras.
    
    Un usuario puede tener múltiples carritos (histórico),
    pero solo uno activo a la vez.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    estado: str = Field(default=EstadoCarrito.ACTIVO.value, max_length=20)
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    fecha_actualizacion: datetime = Field(default_factory=datetime.utcnow)
    
    # Relaciones
    usuario: "Usuario" = Relationship(back_populates="carritos")
    items: list["ItemCarrito"] = Relationship(
        back_populates="carrito",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class ItemCarrito(SQLModel, table=True):
    """Modelo de Item del Carrito.
    
    Representa un producto dentro del carrito con su cantidad.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id", index=True)
    producto_id: int = Field(foreign_key="producto.id", index=True)
    cantidad: int = Field(gt=0)  # Mayor que 0
    
    # Relaciones
    carrito: Carrito = Relationship(back_populates="items")
    producto: "Producto" = Relationship()


# ==================== SCHEMAS ====================

class ItemCarritoCreate(SQLModel):
    """Schema para agregar producto al carrito."""
    producto_id: int = Field(gt=0)
    cantidad: int = Field(gt=0, default=1)


class ItemCarritoResponse(SQLModel):
    """Schema para respuesta de item del carrito."""
    id: int
    producto_id: int
    cantidad: int
    # Datos del producto (para no hacer queries extra)
    titulo: str
    precio: float
    imagen: str
    subtotal: float  # precio * cantidad


class CarritoResponse(SQLModel):
    """Schema para respuesta completa del carrito."""
    id: int
    estado: str
    items: list[ItemCarritoResponse]
    subtotal: float  # Suma de todos los items (sin IVA ni envío)
    iva: float  # 21% o 10% según productos
    envio: float  # $50 o gratis si subtotal > $1000
    total: float  # subtotal + iva + envio
    cantidad_items: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
