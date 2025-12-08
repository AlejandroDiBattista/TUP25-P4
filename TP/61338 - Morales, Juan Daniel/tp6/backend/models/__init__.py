from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: str = Field(index=True, unique=True)
    password_hash: str
    token: Optional[str] = Field(default=None)


    carritos: List["Carrito"] = Relationship(back_populates="usuario")
    compras: List["Compra"] = Relationship(back_populates="usuario")
    


class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    descripcion: str
    precio: float
    categoria: str
    existencia: int
    imagen: Optional[str] = None  # filename


class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: str = Field(default="abierto")  # abierto | finalizado | cancelado

    usuario: Optional[Usuario] = Relationship(back_populates="carritos")
    items: List["ItemCarrito"] = Relationship(back_populates="carrito")


class ItemCarrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(default=1)

    carrito: Optional[Carrito] = Relationship(back_populates="items")


class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha: datetime = Field(default_factory=datetime.utcnow)
    direccion: str
    tarjeta: str
    total: float
    envio: float

    usuario: Optional[Usuario] = Relationship(back_populates="compras")
    items: List["ItemCompra"] = Relationship(back_populates="compra")


class ItemCompra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int
    cantidad: int
    nombre: str
    precio_unitario: float

    compra: Optional[Compra] = Relationship(back_populates="items")
