from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: str = Field(index=True, unique=True)
    password: str

class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    descripcion: str
    precio: float
    categoria: str
    existencia: int

class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: str  # "activo" o "finalizado"
    items: List["CarritoItem"] = Relationship(back_populates="carrito")

class CarritoItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int
    carrito: Optional[Carrito] = Relationship(back_populates="items")

class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha: datetime
    direccion_envio: str
    metodo_pago: str
    total_productos: float
    total_iva: float
    costo_envio: float
    total_final: float
    items: List["CompraItem"] = Relationship(back_populates="compra")

class CompraItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int
    nombre_producto_snapshot: str
    precio_unitario_snapshot: float
    cantidad: int
    compra: Optional[Compra] = Relationship(back_populates="items")
