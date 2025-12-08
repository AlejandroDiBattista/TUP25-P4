# backend/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UsuarioCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ProductoOut(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    precio: float
    categoria: Optional[str]
    existencia: int
    imagen: Optional[str]

class AddToCart(BaseModel):
    product_id: int
    cantidad: int

class CheckoutData(BaseModel):
    direccion: str
    tarjeta: str

class CompraOut(BaseModel):
    id: int
    usuario_id: int
    fecha: str
    direccion: str
    subtotal: float
    iva: float
    envio: float
    total: float
