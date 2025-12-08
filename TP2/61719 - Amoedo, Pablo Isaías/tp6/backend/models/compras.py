from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_email: str
    fecha: datetime = Field(default_factory=datetime.utcnow)
    direccion: Optional[str] = None
    tarjeta: Optional[str] = None
    total: float
    iva: float = 0.0
    envio: float = 0.0
    subtotal: float = 0.0


class CompraDetalle(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int
    nombre_producto: str
    cantidad: int
    precio_unitario: float
