from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: str = Field(index=True)
    hashed_password: str
    carts: List["Cart"] = Relationship(back_populates="usuario")
    purchases: List["Purchase"] = Relationship(back_populates="usuario")


class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    descripcion: Optional[str] = ""
    precio: float = 0.0
    categoria: Optional[str] = ""
    existencia: int = 0
    imagen: Optional[str] = None
    cart_items: List["CartItem"] = Relationship(back_populates="producto")


class CartItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cart_id: Optional[int] = Field(default=None, foreign_key="cart.id")
    producto_id: Optional[int] = Field(default=None, foreign_key="product.id")
    cantidad: int = 1
    cart: Optional["Cart"] = Relationship(back_populates="items")
    producto: Optional[Product] = Relationship(back_populates="cart_items")


class Cart(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: Optional[int] = Field(default=None, foreign_key="user.id")
    estado: str = Field(default="activo")
    items: List[CartItem] = Relationship(back_populates="cart")
    usuario: Optional[User] = Relationship(back_populates="carts")


class PurchaseItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    purchase_id: Optional[int] = Field(default=None, foreign_key="purchase.id")
    producto_id: Optional[int] = Field(default=None)
    cantidad: int = 1
    nombre: Optional[str] = None
    precio_unitario: float = 0.0
    purchase: Optional["Purchase"] = Relationship(back_populates="items")


class Purchase(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: Optional[int] = Field(default=None, foreign_key="user.id")
    fecha: datetime = Field(default_factory=datetime.utcnow)
    direccion: Optional[str] = None
    tarjeta: Optional[str] = None
    total: float = 0.0
    envio: float = 0.0
    iva_total: float = 0.0
    items: List[PurchaseItem] = Relationship(back_populates="purchase")
    usuario: Optional[User] = Relationship(back_populates="purchases")


class RevokedToken(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    token: Optional[str] = None
    jti: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
