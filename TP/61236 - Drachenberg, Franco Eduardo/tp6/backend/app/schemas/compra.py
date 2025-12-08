from datetime import datetime

from pydantic import BaseModel


class ItemCompraRead(BaseModel):
    producto_id: int
    nombre: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class CompraResumen(BaseModel):
    id: int
    fecha: datetime
    subtotal: float
    iva: float
    envio: float
    total: float
    cantidad_items: int


class CompraDetalle(CompraResumen):
    items: list[ItemCompraRead]
