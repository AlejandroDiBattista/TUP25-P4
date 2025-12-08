from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class Cart(SQLModel, table=True):
    """Carrito de compras del usuario."""

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="user.id", index=True)
    estado: str = Field(default="activo", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    items: list["CartItem"] = Relationship(
        back_populates="cart", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class CartItem(SQLModel, table=True):
    """Item dentro de un carrito."""

    id: Optional[int] = Field(default=None, primary_key=True)
    cart_id: int = Field(foreign_key="cart.id", index=True)
    producto_id: int = Field(foreign_key="product.id")
    cantidad: int = Field(ge=1)

    cart: Optional[Cart] = Relationship(back_populates="items")

