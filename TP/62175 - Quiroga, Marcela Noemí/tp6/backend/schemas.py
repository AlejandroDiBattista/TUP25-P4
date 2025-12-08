from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Schemas de autenticación
class UsuarioRegistro(BaseModel):
    nombre: str
    email: EmailStr
    contraseña: str

class UsuarioLogin(BaseModel):
    email: EmailStr
    contraseña: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Schemas de productos
class ProductoResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str
    precio: float
    categoria: str
    existencia: int

    class Config:
        from_attributes = True

class ProductoCreate(BaseModel):
    nombre: str
    descripcion: str
    precio: float
    categoria: str
    existencia: int

# Schemas de carrito
class ItemCarritoResponse(BaseModel):
    id: int
    producto_id: int
    cantidad: int
    producto: ProductoResponse

    class Config:
        from_attributes = True

class CarritoResponse(BaseModel):
    id: int
    estado: str
    items: List[ItemCarritoResponse]

    class Config:
        from_attributes = True

class ItemCarritoAdd(BaseModel):
    producto_id: int
    cantidad: int

# Schemas de compra
class ItemCompraResponse(BaseModel):
    id: int
    producto_id: int
    cantidad: int
    nombre: str
    precio_unitario: float

    class Config:
        from_attributes = True

class CompraResponse(BaseModel):
    id: int
    fecha: datetime
    direccion: str
    tarjeta: str
    total: float
    envio: float
    items: List[ItemCompraResponse]

    class Config:
        from_attributes = True

class CompraResumen(BaseModel):
    id: int
    fecha: datetime
    total: float
    cantidad_items: int

    class Config:
        from_attributes = True

class FinalizarCompra(BaseModel):
    direccion: str
    tarjeta: str

