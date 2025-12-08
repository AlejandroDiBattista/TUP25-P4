from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class Compra(SQLModel, table=True):
    #Registro de una compra finalizada
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha: datetime = Field(default_factory=datetime.utcnow)
    direccion: str = Field(max_length=255)
    tarjeta: str = Field(max_length=64)
    total: float = Field(default=0, ge=0)
    envio: float = Field(default=0, ge=0)

    usuario: "Usuario" = Relationship(back_populates="compras")
    items: list["ItemCompra"] = Relationship(back_populates="compra")


class ItemCompra(SQLModel, table=True):
    #Detalle de producto en una compra
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int = Field(foreign_key="producto.id")
    nombre: str = Field(max_length=255)
    precio_unitario: float = Field(default=0, ge=0)
    cantidad: int = Field(default=1, ge=1)

    compra: Compra = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="items_compra")
