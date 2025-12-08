from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class CarritoAgregar(BaseModel):
    producto_id: int
    cantidad: int = Field(default=1, ge=1, le=99)


class CarritoItemDetalle(BaseModel):
    producto_id: int
    nombre: str
    cantidad: int
    precio_unitario: float
    subtotal: float
    categoria: str
    imagen: Optional[str] = None
    valoracion: Optional[float] = None


class CarritoDetalle(BaseModel):
    id: int
    estado: str
    total_items: int
    subtotal: float
    iva: float
    envio: float
    total: float
    items: list[CarritoItemDetalle]


class CarritoFinalizarPayload(BaseModel):
    direccion: str = Field(min_length=6, max_length=255)
    tarjeta: str = Field(min_length=12, max_length=19)
