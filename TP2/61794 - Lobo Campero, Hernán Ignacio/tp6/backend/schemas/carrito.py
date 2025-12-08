from pydantic import BaseModel
from typing import List


class ItemCarritoBase(BaseModel):
    producto_id: int
    cantidad: int
    precio_unitario: float


class ItemCarritoResponse(ItemCarritoBase):
    id: int
    carrito_id: int

    class Config:
        from_attributes = True


class CarritoBase(BaseModel):
    usuario_id: int
    estado: str = "activo"


class CarritoResponse(CarritoBase):
    id: int
    items: List[ItemCarritoResponse] = []

    class Config:
        from_attributes = True


class AgregarAlCarritoRequest(BaseModel):
    producto_id: int
    cantidad: int


class FinalizarCompraRequest(BaseModel):
    direccion: str
    tarjeta_numero: str  # Por seguridad, solo los últimos 4 dígitos se guardarán
