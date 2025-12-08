from sqlmodel import SQLModel, Field
from typing import Optional

class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int
    fecha: str
    direccion: str
    tarjeta: str
    subtotal: float
    iva: float
    envio: float
    total: float

class ItemCompra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    nombre: str
    cantidad: int
    precio_unitario: float