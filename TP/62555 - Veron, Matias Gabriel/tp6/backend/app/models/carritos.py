from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: Optional[int] = Field(default=None, foreign_key="usuario.id")
    total: float = Field(default=0.0, ge=0)

    usuario: Optional["Usuario"] = Relationship(back_populates="carritos")
    items: List["CarritoItem"] = Relationship(back_populates="carrito")


class CarritoItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(default=1, ge=1)

    carrito: Optional["Carrito"] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship(back_populates="carrito_items")
