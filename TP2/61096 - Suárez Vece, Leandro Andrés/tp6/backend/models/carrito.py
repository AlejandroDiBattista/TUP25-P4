from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.usuarios import Usuario
    from models.carrito import Carrito
    from models.productos import Producto

class ItemCarrito(SQLModel, table=True):
    """Relación entre Carrito y Producto con cantidad."""
    carrito_id: Optional[int] = Field(default=None, foreign_key="carrito.id", primary_key=True)
    producto_id: Optional[int] = Field(default=None, foreign_key="producto.id", primary_key=True)
    cantidad: int = Field(default=1, ge=1)

    carrito: Optional["Carrito"] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship()


class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: str = Field(default="activo", max_length=50)

    usuario: Optional["Usuario"] = Relationship(back_populates="carritos")
    items: List["ItemCarrito"] = Relationship(back_populates="carrito")



