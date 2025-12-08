
from datetime import datetime
from typing import List

from sqlmodel import SQLModel


# ============
# AUTENTICACIÓN
# ============

class RegistroCliente(SQLModel):
    nombre: str
    correo: str
    password: str


class LoginCliente(SQLModel):
    correo: str
    password: str


class ClientePublico(SQLModel):
    id: int
    nombre: str
    correo: str


class TokenRespuesta(SQLModel):
    access_token: str
    token_type: str = "bearer"
    usuario_nombre: str


# ============
# PRODUCTOS
# ============

class ArticuloPublico(SQLModel):
    id: int
    titulo: str
    descripcion: str
    precio: float
    categoria: str
    existencias: int
    imagen: str
    agotado: bool
    es_electronico: bool


# ============
# CARRITO
# ============

class AgregarAlCarrito(SQLModel):
    articulo_id: int
    cantidad: int = 1


class LineaCarritoPublica(SQLModel):
    articulo_id: int
    nombre: str
    imagen: str
    cantidad: int
    precio_unitario: float
    subtotal: float


class CarritoPublico(SQLModel):
    id: int
    items: List[LineaCarritoPublica]
    total_productos: int
    subtotal: float
    iva: float
    envio: float
    total: float


class DatosEnvioPago(SQLModel):
    direccion: str
    tarjeta: str


# ============
# COMPRAS
# ============

class CompraResumen(SQLModel):
    id: int
    fecha: datetime
    total: float


class CompraDetalle(SQLModel):
    id: int
    fecha: datetime
    direccion_envio: str
    tarjeta: str
    subtotal: float
    iva: float
    costo_envio: float
    total: float
    productos: List[LineaCarritoPublica]
