from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class Carrito(SQLModel, table=True):
    #Carrito de compras con usuario.
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: str = Field(default="abierto", max_length=20)

    usuario: "Usuario" = Relationship(back_populates="carritos")
    items: list["ItemCarrito"] = Relationship(back_populates="carrito")


class ItemCarrito(SQLModel, table=True):
    #Producto y cantidad.
    carrito_id: int = Field(foreign_key="carrito.id", primary_key=True)
    producto_id: int = Field(foreign_key="producto.id", primary_key=True)
    cantidad: int = Field(default=1, ge=1)

    carrito: Carrito = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="items_carrito")
