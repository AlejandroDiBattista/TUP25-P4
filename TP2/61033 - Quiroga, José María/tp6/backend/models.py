from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
import datetime


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: str = Field(index=True)
    hashed_password: str


class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    descripcion: str
    precio: float
    categoria: str
    existencia: int


class Cart(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="user.id")
    estado: str = Field(default="activo")
    items: List["CartItem"] = Relationship(back_populates="cart")


class CartItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cart_id: int = Field(foreign_key="cart.id")
    producto_id: int = Field(foreign_key="product.id")
    cantidad: int
    cart: Optional[Cart] = Relationship(back_populates="items")


class Purchase(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="user.id")
    fecha: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    direccion: str
    tarjeta: str
    total: float
    envio: float
    items: List["PurchaseItem"] = Relationship(back_populates="purchase")


class PurchaseItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="purchase.id")
    producto_id: int
    cantidad: int
    nombre: str
    precio_unitario: float
    purchase: Optional[Purchase] = Relationship(back_populates="items")
