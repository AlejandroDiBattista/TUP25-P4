from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=255)
    email: str = Field(max_length=255, unique=True)
    password: str = Field(max_length=255)

class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=255)
    descripcion: str = Field(default="")
    precio: float = Field(default=0.0, ge=0)
    categoria: str = Field(max_length=100)
    existencia: int = Field(default=0, ge=0)
    imagen: Optional[str] = Field(default=None)

class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: str = Field(default="activo")

class CarritoItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(default=1, ge=1)

class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha: str
    direccion: str
    tarjeta: str
    total: float
    envio: float

class CompraItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(default=1, ge=1)
    nombre: str
    precio_unitario: float
