from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime


class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha: datetime = Field(default_factory=datetime.utcnow)
    direccion_envio: str = Field(default="")
    tarjeta: str = Field(default="")
    total: float = Field(default=0.0, ge=0)

    usuario: Optional["Usuario"] = Relationship(back_populates="compras")
    items: List["CompraItem"] = Relationship(back_populates="compra")


class CompraItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(default=1, ge=1)
    subtotal: float = Field(default=0.0, ge=0)

    compra: Optional["Compra"] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship(back_populates="compra_items")
