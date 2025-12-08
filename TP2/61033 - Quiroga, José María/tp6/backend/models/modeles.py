# backend/models.py
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: str = Field(index=True, unique=True)
    hashed_password: str

class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    descripcion: Optional[str] = ""
    precio: float
    categoria: Optional[str] = ""
    existencia: int = 0
    imagen: Optional[str] = None

class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int
    estado: str = "abierto"  # "abierto", "finalizado", "cancelado"

class CarritoItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int
    producto_id: int
    cantidad: int

class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int
    fecha: datetime = Field(default_factory=datetime.utcnow)
    direccion: str
    tarjeta: str
    subtotal: float
    iva: float
    envio: float
    total: float

class CompraItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int
    producto_id: int
    cantidad: int
    nombre: str
    precio_unitario: float
