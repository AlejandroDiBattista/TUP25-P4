from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum

class EstadoCarrito(str, Enum):
    ACTIVO = "activo"
    FINALIZADO = "finalizado"
    CANCELADO = "cancelado"

# Modelos base
class UsuarioBase(SQLModel):
    nombre: str
    email: str

class Usuario(UsuarioBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    contraseña: str  # Hasheada
    carritos: List["Carrito"] = Relationship(back_populates="usuario")
    compras: List["Compra"] = Relationship(back_populates="usuario")

class ProductoBase(SQLModel):
    nombre: str
    descripcion: str
    precio: float
    categoria: str
    existencia: int

class Producto(ProductoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    items_carrito: List["ItemCarrito"] = Relationship(back_populates="producto")
    items_compra: List["ItemCompra"] = Relationship(back_populates="producto")

class CarritoBase(SQLModel):
    estado: EstadoCarrito = EstadoCarrito.ACTIVO

class Carrito(CarritoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    usuario: Usuario = Relationship(back_populates="carritos")
    items: List["ItemCarrito"] = Relationship(back_populates="carrito")

class ItemCarritoBase(SQLModel):
    cantidad: int

class ItemCarrito(ItemCarritoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id")
    producto_id: int = Field(foreign_key="producto.id")
    carrito: Carrito = Relationship(back_populates="items")
    producto: Producto = Relationship(back_populates="items_carrito")

class CompraBase(SQLModel):
    fecha: datetime = Field(default_factory=datetime.now)
    direccion: str
    tarjeta: str
    total: float
    envio: float

class Compra(CompraBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    usuario: Usuario = Relationship(back_populates="compras")
    items: List["ItemCompra"] = Relationship(back_populates="compra")

class ItemCompraBase(SQLModel):
    cantidad: int
    nombre: str
    precio_unitario: float

class ItemCompra(ItemCompraBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int = Field(foreign_key="producto.id")
    compra: Compra = Relationship(back_populates="items")
    producto: Producto = Relationship(back_populates="items_compra")

