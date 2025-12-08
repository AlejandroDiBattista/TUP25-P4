from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class UsuarioBase(SQLModel):
    nombre: str
    email: str

class Usuario(UsuarioBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    carritos: List["Carrito"] = Relationship(back_populates="usuario")
    compras: List["Compra"] = Relationship(back_populates="usuario")

class UsuarioCreate(UsuarioBase):
    password: str

class ProductoBase(SQLModel):
    nombre: str
    descripcion: str
    precio: float
    categoria: str
    existencia: int
    imagen: Optional[str] = None

class Producto(ProductoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    items_carrito: List["ItemCarrito"] = Relationship(back_populates="producto")
    items_compra: List["ItemCompra"] = Relationship(back_populates="producto")

class CarritoBase(SQLModel):
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: str = "activo"

class Carrito(CarritoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario: Usuario = Relationship(back_populates="carritos")
    items: List["ItemCarrito"] = Relationship(back_populates="carrito")

class ItemCarritoBase(SQLModel):
    carrito_id: int = Field(foreign_key="carrito.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int

class ItemCarrito(ItemCarritoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito: Carrito = Relationship(back_populates="items")
    producto: Producto = Relationship(back_populates="items_carrito")

class ItemCarritoCreate(BaseModel):
    producto_id: int
    cantidad: int

class CompraBase(SQLModel):
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha: datetime
    direccion: str
    tarjeta: str
    total: float
    envio: float

class Compra(CompraBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario: Usuario = Relationship(back_populates="compras")
    items: List["ItemCompra"] = Relationship(back_populates="compra")

class ItemCompraBase(SQLModel):
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int
    nombre: str
    precio_unitario: float

class ItemCompra(ItemCompraBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra: Compra = Relationship(back_populates="items")
    producto: Producto = Relationship(back_populates="items_compra")

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class DatosCompra(BaseModel):
    direccion: str
    tarjeta: str

class CarritoResponse(CarritoBase):
    id: int
    items: List[ItemCarritoBase]

class CompraResponse(CompraBase):
    id: int
    items: List[ItemCompraBase]
# Este archivo permite que Python trate a 'models' como un paquete
