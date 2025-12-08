from __future__ import annotations

from typing import Optional

from sqlmodel import Field, SQLModel


class Carrito(SQLModel, table=True):
    """Carrito de compras asociado a un usuario."""

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    estado: str = Field(default="abierto", max_length=20)

 

class CarritoItem(SQLModel, table=True):
    """Producto agregado al carrito con su cantidad."""

    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id", index=True)
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(default=1, ge=1)

 