from pydantic import BaseModel


class UsuarioRegistro(BaseModel):
    nombre: str
    email: str
    password: str


class UsuarioLogin(BaseModel):
    email: str
    password: str


class ProductoCreateDTO(BaseModel):
    titulo: str
    precio: float
    categoria: str
    descripcion: str | None = None
    existencia: int | None = None
    valoracion: float | None = None
    imagen: str | None = None


class ProductoUpdateDTO(BaseModel):
    titulo: str | None = None
    precio: float | None = None
    categoria: str | None = None
    descripcion: str | None = None
    existencia: int | None = None
    valoracion: float | None = None
    imagen: str | None = None


class CarritoAgregar(BaseModel):
    producto_id: int
    cantidad: int


from datetime import datetime
from typing import List, Optional

class CompraItemSchema(BaseModel):
    producto_id: int
    titulo: str
    imagen: str | None = None
    cantidad: int
    precio_unitario: float
    subtotal: float

class CompraCreateDTO(BaseModel):
    direccion: str
    tarjeta: str

class CompraDTO(BaseModel):
    id: int
    usuario_id: int
    fecha: datetime
    total: float
    direccion: str
    estado: str
    items: List[CompraItemSchema]

class CompraResumenDTO(BaseModel):
    id: int
    fecha: datetime
    total: float
    estado: str

