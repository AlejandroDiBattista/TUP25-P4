from sqlmodel import SQLModel, Field
from typing import Optional

class Cart(SQLModel, table=True):
    __tablename__ = "carts"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    estado: str = "abierto"  # abierto | finalizado | cancelado

class CartItem(SQLModel, table=True):
    __tablename__ = "cart_items"
    id: Optional[int] = Field(default=None, primary_key=True)
    cart_id: int
    product_id: int
    cantidad: int


