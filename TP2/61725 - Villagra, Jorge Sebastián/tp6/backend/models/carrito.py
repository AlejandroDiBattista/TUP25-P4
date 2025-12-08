from typing import Optional, TYPE_CHECKING, List
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .usuario import Usuario
    from .productos import Producto  # solo para tipos

class Carrito(SQLModel, table=True):
    __tablename__ = "carrito"
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    estado: str = Field(default="abierto", index=True)  # abierto | comprado | cancelado

    # inversa hacia Usuario (Usuario.carritos)
    usuario: "Usuario" = Relationship(back_populates="carritos")

    # items del carrito
    items: List["CarritoItem"] = Relationship(
        back_populates="carrito",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )

class CarritoItem(SQLModel, table=True):
    __tablename__ = "carrito_item"
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id", index=True)
    producto_id: int = Field(foreign_key="producto.id", index=True)
    cantidad: int = Field(default=1, ge=1)

    carrito: "Carrito" = Relationship(back_populates="items")
