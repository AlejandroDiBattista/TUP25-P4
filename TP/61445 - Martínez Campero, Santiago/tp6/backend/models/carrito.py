"""Modelos de Carrito e ItemCarrito para gestionar compras en progreso."""

from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from enum import Enum


class EstadoCarrito(str, Enum):
    """Estados posibles del carrito."""
    ACTIVO = "activo"
    FINALIZADO = "finalizado"
    CANCELADO = "cancelado"


class ItemCarrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(gt=0)


class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    estado: EstadoCarrito = Field(default=EstadoCarrito.ACTIVO)
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    fecha_cancelacion: Optional[datetime] = Field(default=None)


class ItemCarritoCreate(SQLModel):
    producto_id: int
    cantidad: int = Field(gt=0, default=1)


class CarritoResponse(SQLModel):
    id: int
    usuario_id: int
    estado: EstadoCarrito
    fecha_creacion: datetime
