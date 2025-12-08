from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class CartItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="cart.id")
    producto_id: int
    cantidad: int

class Cart(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="user.id")
    estado: str  # "abierto" o "finalizado"

    items: List[CartItem] = Relationship(back_populates=None)
