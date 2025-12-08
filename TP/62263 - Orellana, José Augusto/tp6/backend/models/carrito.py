from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

# Se usan los modelos de Usuario y Producto que se vincularán
from .usuarios import Usuario
from .productos import Producto

class CarritoItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    # Claves foráneas
    # 1. Link del carrito
    carrito_id: int = Field(foreign_key="carrito.id")

    # 2. Link del producto
    producto_id: int = Field(foreign_key="producto.id")

    # Datos del Item
    cantidad: int = Field(default=1, ge=1)

    # Relaciones
    carrito: "Carrito" = Relationship(back_populates="items")

    # "producto" permite navegar desde el CarritoItem al Producto
    producto: Producto = Relationship()

class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    # Clave foránea al Usuario
    usuario_id: int = Field(foreign_key="usuario.id", unique=True)

    # Relaciones
    usuario: Usuario = Relationship()

    # Lista de items en el carrito
    items: List[CarritoItem] = Relationship(back_populates="carrito")