from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, timedelta, timezone

argentina_timezone =  timezone(timedelta(hours=-3))

class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    fecha: datetime = Field(default_factory=lambda: datetime.now(argentina_timezone))
    direccion: str = Field(default="", max_length=255)
    tarjeta: str = Field(default="", max_length=16)
    total: float = Field(default=0.0, ge=0)
    envio: float = Field(default=0.0, ge=0)

    usuarios: Optional["Usuario"] = Relationship(back_populates="compras")
    items: List[ItemCompra] =  Relationship()

class ItemCompra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id", index=True)
    producto_id: int = Field(default=0)
    nombre: str = Field(default="", max_length=255)
    cantidad: int = Field(default=1, ge=1)
    precio_unitario: float = Field(default=0.0, ge=0)