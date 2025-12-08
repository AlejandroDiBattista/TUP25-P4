from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: str  # "abierto", "finalizado", "cancelado"

    usuario: "Usuario" = Relationship(back_populates="carritos")
    items: List["ItemCarrito"] = Relationship(back_populates="carrito")


class ItemCarrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cantidad: int
    carrito_id: int = Field(foreign_key="carrito.id")
    producto_id: int = Field(foreign_key="producto.id")

    carrito: Carrito = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="items_carrito")