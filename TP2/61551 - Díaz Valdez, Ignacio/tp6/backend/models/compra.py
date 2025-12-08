from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .usuario import Usuario  # noqa: F401
    from .productos import Producto  # noqa: F401


class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    total: float = 0
    usuario: Optional["Usuario"] = Relationship(back_populates="compras")
    items: List["CompraItem"] = Relationship(back_populates="compra")


class CompraItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = 1
    precio_unitario: float
    compra: Optional[Compra] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship()