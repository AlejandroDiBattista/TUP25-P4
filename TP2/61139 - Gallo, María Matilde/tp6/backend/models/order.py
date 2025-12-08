from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Purchase(SQLModel, table=True):
    __tablename__ = "purchases"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    fecha: datetime = Field(default_factory=datetime.utcnow)
    direccion: str
    tarjeta: str
    subtotal: float
    iva: float
    envio: float
    total: float

class PurchaseItem(SQLModel, table=True):
    __tablename__ = "purchase_items"
    id: Optional[int] = Field(default=None, primary_key=True)
    purchase_id: int
    product_id: int
    nombre: str
    precio_unitario: float
    cantidad: int
