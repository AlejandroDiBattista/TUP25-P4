from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class ItemCompra(SQLModel, table=True):
    """Modelo de ítem en una compra"""
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int
    nombre: str
    precio_unitario: float

    class Config:
        table_name = "items_compra"


class Compra(SQLModel, table=True):
    """Modelo de compra realizada"""
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha: datetime = Field(default_factory=datetime.utcnow)
    direccion: str
    total: float
    iva: float
    envio: float
    tarjeta_ultimos_digitos: str  # Guardar solo los últimos 4 dígitos por seguridad

    class Config:
        table_name = "compra"
