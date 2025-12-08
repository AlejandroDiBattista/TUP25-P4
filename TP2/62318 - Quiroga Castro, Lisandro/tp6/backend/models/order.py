from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class OrderItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="order.id")
    producto_id: int
    cantidad: int
    nombre: str
    precio_unitario: float

class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="user.id")
    fecha: str
    direccion: str
    tarjeta: str
    total: float
    envio: float

    items: List[OrderItem] = Relationship(back_populates=None)
