from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int
    fecha: datetime
    direccion: str
    tarjeta: str   
    subtotal: float
    iva: float
    envio: float
    total: float

class CompraItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int
    nombre: str
    precio_unitario: float
    cantidad: int
    categoria: Optional[str] = None   
    iva: float = 0.0                  
