from sqlmodel import Field, SQLModel ,Relationship
from datetime import datetime

from typing import Optional, List

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.usuarios import Usuario
    from models.compras import Compra
    from models.productos import Producto

class ItemCompra(SQLModel, table=True):
    """Detalle de productos comprados."""
    compra_id: Optional[int] = Field(default=None, foreign_key="compra.id", primary_key=True)
    producto_id: Optional[int] = Field(default=None, foreign_key="producto.id", primary_key=True)
    cantidad: int = Field(default=1, ge=1)
    nombre: str = Field(max_length=255)
    precio_unitario: float = Field(ge=0)
    iva: float = Field(ge=0)

    compra: Optional["Compra"] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship()


class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha: datetime = Field(default_factory=datetime.utcnow)
    direccion: str = Field(max_length=255)
    tarjeta: str = Field(max_length=20)  # En producción, ¡nunca guardes tarjetas directamente!
    total: float = Field(ge=0)
    envio: float = Field(ge=0)

    usuario: Optional["Usuario"] = Relationship(back_populates="compras")
    items: List["ItemCompra"] = Relationship(back_populates="compra")


