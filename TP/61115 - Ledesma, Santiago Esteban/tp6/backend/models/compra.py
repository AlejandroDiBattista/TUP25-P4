from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha: datetime
    direccion: str
    tarjeta: str
    total: float
    envio: float

    usuario: "Usuario" = Relationship(back_populates="compras")
    items: List["ItemCompra"] = Relationship(back_populates="compra")


class ItemCompra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cantidad: int
    nombre: str
    precio_unitario: float
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int = Field(foreign_key="producto.id")

    compra: Compra = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="items_compra")