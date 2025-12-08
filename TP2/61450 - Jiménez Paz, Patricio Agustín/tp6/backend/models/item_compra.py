from typing import Optional
from sqlmodel import Field, SQLModel


class ItemCompra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id", index=True)
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(ge=1)
    precio_unitario: float = Field(ge=0)
    subtotal: float = Field(ge=0)
