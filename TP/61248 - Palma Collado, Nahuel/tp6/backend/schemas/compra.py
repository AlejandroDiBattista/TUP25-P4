from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel

from .carrito import CarritoDetalle, CarritoItemDetalle


class CompraResumen(BaseModel):
    id: int
    fecha: datetime
    total: float
    envio: float
    subtotal: float
    iva: float
    direccion: str

    class Config:
        from_attributes = True


class CompraDetalle(CompraResumen):
    items: list[CarritoItemDetalle]


class CompraFinalizada(BaseModel):
    compra: CompraDetalle
    carrito: CarritoDetalle
