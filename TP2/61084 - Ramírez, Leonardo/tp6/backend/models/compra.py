from typing import Optional
from sqlmodel import Field, SQLModel, Column, JSON
from datetime import datetime


class Compra(SQLModel, table=True):
    """Modelo de Compra para la base de datos."""
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_email: str = Field(index=True)
    items: str = Field(sa_column=Column(JSON))  # JSON string de los items
    subtotal: float = Field(default=0.0)
    iva: float = Field(default=0.0)
    envio: float = Field(default=0.0)
    total: float = Field(default=0.0)
    direccion: str = Field(default="")
    tarjeta: str = Field(default="")
    fecha: datetime = Field(default_factory=datetime.utcnow)
