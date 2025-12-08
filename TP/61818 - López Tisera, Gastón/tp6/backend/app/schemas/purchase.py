from datetime import datetime

from pydantic import BaseModel


class PurchaseItemRead(BaseModel):
    id: int
    producto_id: int
    nombre: str
    cantidad: int
    precio_unitario: float

    class Config:
        from_attributes = True


class PurchaseRead(BaseModel):
    id: int
    fecha: datetime
    direccion: str
    tarjeta: str
    envio: float
    total: float
    items: list[PurchaseItemRead]

    class Config:
        from_attributes = True

