"""
Modelos de Compra y ItemCompra para la base de datos.

Define la estructura de compras finalizadas y su historial.
"""
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

if TYPE_CHECKING:
    from .usuario import Usuario


class Compra(SQLModel, table=True):
    """Modelo de Compra finalizada.
    
    Representa una compra realizada por un usuario.
    Guarda un snapshot del momento de la compra para historial.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    fecha: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Dirección de envío
    direccion: str = Field(max_length=500)
    
    # Datos de pago (en producción iría encriptado o tokenizado)
    # Solo guardamos los últimos 4 dígitos
    tarjeta: str = Field(max_length=19)
    
    # Montos
    subtotal: float = Field(ge=0)
    iva: float = Field(ge=0)
    envio: float = Field(ge=0)
    total: float = Field(ge=0)
    
    # Relaciones
    usuario: "Usuario" = Relationship(back_populates="compras")
    items: list["ItemCompra"] = Relationship(
        back_populates="compra",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class ItemCompra(SQLModel, table=True):
    """Modelo de Item de Compra.
    
    Guarda snapshot del producto al momento de la compra
    (por si cambia precio o se elimina el producto).
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id", index=True)
    producto_id: int = Field(foreign_key="producto.id")  # Referencia original
    
    # Snapshot del producto al momento de compra
    nombre: str = Field(max_length=255)
    precio_unitario: float = Field(gt=0)
    cantidad: int = Field(gt=0)
    categoria: str = Field(max_length=100)  # Para cálculo de IVA histórico
    imagen: str = Field(max_length=500)  # Ruta de la imagen
    
    # Relaciones
    compra: Compra = Relationship(back_populates="items")
    
    @property
    def subtotal(self) -> float:
        """Calcula el subtotal del item."""
        return self.precio_unitario * self.cantidad


# ==================== SCHEMAS ====================

class CompraCreate(SQLModel):
    """Schema para crear una compra (finalizar carrito)."""
    direccion: str = Field(min_length=10, max_length=500)
    tarjeta: str = Field(
        min_length=15,
        max_length=19,
        description="Número de tarjeta (se guardará solo los últimos 4 dígitos)"
    )


class ItemCompraResponse(SQLModel):
    """Schema para respuesta de item de compra."""
    id: int
    producto_id: int
    nombre: str
    precio_unitario: float
    cantidad: int
    subtotal: float
    categoria: str
    imagen: str


class CompraResumenResponse(SQLModel):
    """Schema para respuesta resumida de compra (listado)."""
    id: int
    fecha: datetime
    total: float
    cantidad_items: int


class CompraDetalleResponse(SQLModel):
    """Schema para respuesta detallada de compra."""
    id: int
    fecha: datetime
    direccion: str
    tarjeta: str  # Solo últimos 4 dígitos
    items: list[ItemCompraResponse]
    subtotal: float
    iva: float
    envio: float
    total: float
    cantidad_items: int
