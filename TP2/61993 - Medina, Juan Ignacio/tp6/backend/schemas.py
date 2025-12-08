from pydantic import BaseModel
from typing import Optional, List

class RegisterSchema(BaseModel):
    nombre: str
    email: str
    password: str

class LoginSchema(BaseModel):
    email: str
    password: str

class AddCarritoSchema(BaseModel):
    producto_id: int
    cantidad: int

class FinalizarSchema(BaseModel):
    direccion: str
    tarjeta: str

class ProductoOut(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    precio: float
    categoria: str
    existencia: int
    imagen: Optional[str]

class CarritoItemOut(BaseModel):
    producto_id: int
    nombre: str
    precio_unitario: float
    cantidad: int
    subtotal: float
    iva: float

class CarritoOut(BaseModel):
    items: List[CarritoItemOut]
    subtotal: float
    iva_total: float
    envio: float
    total: float

class CompraOut(BaseModel):
    id: int
    fecha: str
    direccion: str
    tarjeta: str
    total: float
    envio: float
