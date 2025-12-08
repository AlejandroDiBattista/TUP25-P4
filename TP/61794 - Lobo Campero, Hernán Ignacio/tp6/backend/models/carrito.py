from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime


class ItemCarrito(SQLModel, table=True):
    """Modelo de ítem en el carrito"""
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int
    precio_unitario: float

    class Config:
        table_name = "items_carrito"


class Carrito(SQLModel, table=True):
    """Modelo de carrito de compras"""
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: str = Field(default="activo")  # activo, finalizado, cancelado
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        table_name = "carrito"
