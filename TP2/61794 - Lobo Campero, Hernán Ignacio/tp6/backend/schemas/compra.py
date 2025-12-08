from pydantic import BaseModel
from typing import List
from datetime import datetime


class ItemCompraBase(BaseModel):
    producto_id: int
    cantidad: int
    nombre: str
    precio_unitario: float


class ItemCompraResponse(ItemCompraBase):
    id: int
    compra_id: int

    class Config:
        from_attributes = True


class CompraBase(BaseModel):
    usuario_id: int
    fecha: datetime
    direccion: str
    total: float
    iva: float
    envio: float
    tarjeta_ultimos_digitos: str


class CompraResponse(CompraBase):
    id: int
    items: List[ItemCompraResponse] = []

    class Config:
        from_attributes = True
