from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CompraItemOut(BaseModel):
    producto_id: int
    nombre: str
    precio_unitario: float
    cantidad: int
    iva: float | None = None  

class CompraOut(BaseModel):
    id: int
    fecha: datetime
    subtotal: float
    iva: float
    envio: float
    total: float
    items: List[CompraItemOut]
