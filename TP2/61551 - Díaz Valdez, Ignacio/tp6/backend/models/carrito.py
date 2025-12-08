from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .usuario import Usuario  # noqa: F401
    from .productos import Producto  # noqa: F401


class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", unique=True)
    items: List["CarritoItem"] = Relationship(back_populates="carrito")
    usuario: Optional["Usuario"] = Relationship(back_populates="carrito")


class CarritoItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    producto_id: int = Field(foreign_key="producto.id")
    carrito_id: int = Field(foreign_key="carrito.id")
    cantidad: int = 1
    carrito: Optional[Carrito] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship()