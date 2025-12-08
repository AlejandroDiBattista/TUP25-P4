from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha: datetime = Field(default_factory=datetime.now)
    direccion: str
    tarjeta: str
    subtotal: float
    iva: float
    envio: float
    total: float

class DetalleCompra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_nombre: str
    producto_precio: float
    cantidad: int

class CompraResponse(SQLModel):
    id: int
    fecha: datetime
    total: float
    direccion: str
    productos: List[dict]

class CompraDetalleResponse(SQLModel):
    id: int
    fecha: datetime
    direccion: str
    tarjeta: str
    subtotal: float
    iva: float
    envio: float
    total: float
    productos: List[dict]