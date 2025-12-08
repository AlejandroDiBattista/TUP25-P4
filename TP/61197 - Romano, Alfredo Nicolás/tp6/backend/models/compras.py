from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel


class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(index=True)
    fecha: datetime = Field(default_factory=datetime.utcnow)
    direccion: str
    tarjeta: str
    subtotal: float = 0.0
    iva: float = 0.0
    envio: float = 0.0
    total: float = 0.0


class CompraItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int
    cantidad: int
    nombre: str
    precio_unitario: float
