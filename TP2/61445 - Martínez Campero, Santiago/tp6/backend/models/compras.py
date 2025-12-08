"""Modelos de Compra e ItemCompra para el historial de compras."""

from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime
from enum import Enum


class EstadoCompra(str, Enum):
    """Estados posibles de una compra."""
    PENDIENTE = "pendiente"
    CONFIRMADA = "confirmada"
    CANCELADA = "cancelada"


class ItemCompra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int
    cantidad: int = Field(gt=0)
    nombre_producto: str
    precio_unitario: float = Field(ge=0)
    imagen: str = Field(max_length=255)
    precio_total: float = Field(ge=0)


class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    fecha: datetime = Field(default_factory=datetime.utcnow)
    direccion: str = Field(max_length=255)
    tarjeta: str = Field(max_length=20)
    subtotal: float = Field(ge=0)
    iva: float = Field(ge=0)
    envio: float = Field(ge=0)
    total: float = Field(ge=0)
    estado: EstadoCompra = Field(default=EstadoCompra.CONFIRMADA)


class CompraCreate(SQLModel):
    direccion: str = Field(min_length=5, max_length=255)
    tarjeta: str = Field(min_length=19, max_length=19)


class CompraResponse(SQLModel):
    id: int
    usuario_id: int
    fecha: datetime
    direccion: str
    tarjeta: str
    subtotal: float
    iva: float
    envio: float
    total: float
    estado: EstadoCompra
    items: list['ItemCompraResponse'] = []


class ItemCompraResponse(SQLModel):
    """Item de compra con información extendida para respuestas."""
    id: int
    producto_id: int
    nombre: str
    cantidad: int
    precio_unitario: float
    precio_total: float
    imagen: str


class CompraDetailResponse(CompraResponse):
    items: list[ItemCompraResponse] = []
