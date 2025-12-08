from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

# -------------------------
# USUARIO
# -------------------------
class UsuarioBase(SQLModel):
    nombre: str
    usuario: str
    password: str


class Usuario(UsuarioBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    carrito: Optional["Cart"] = Relationship(back_populates="usuario")
    ordenes: List["Order"] = Relationship(back_populates="usuario")


# -------------------------
# PRODUCTO
# -------------------------
class ProductoBase(SQLModel):
    nombre_producto: str
    precio: float
    stock: int


class Producto(ProductoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    items_carrito: List["CartItem"] = Relationship(back_populates="producto")
    items_orden: List["OrderItem"] = Relationship(back_populates="producto")


# -------------------------
# CARRITO
# -------------------------
class Cart(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")

    usuario: Optional[Usuario] = Relationship(back_populates="carrito")
    items: List["CartItem"] = Relationship(back_populates="carrito", sa_relationship_kwargs={"cascade": "all, delete"})


class CartItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cart_id: int = Field(foreign_key="cart.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int

    carrito: Optional[Cart] = Relationship(back_populates="items")
    producto: Optional[Producto] = Relationship(back_populates="items_carrito")


# -------------------------
# ORDEN / COMPRA
# -------------------------
class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    total: float
    fecha: str

    usuario: Optional[Usuario] = Relationship(back_populates="ordenes")
    items: List["OrderItem"] = Relationship(back_populates="orden", sa_relationship_kwargs={"cascade": "all, delete"})


class OrderItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="order.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int
    precio_unitario: float

    orden: Optional[Order] = Relationship(back_populates="items")
    producto: Optional[Producto] = Relationship(back_populates="items_orden")
