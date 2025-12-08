from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class CarritoItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(index=True, foreign_key="carrito.id")
    producto_id: int
    cantidad: int = 1

class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(index=True)
    estado: str = Field(default="abierto")  # "abierto" | "finalizado" | "cancelado"
    items: List[CarritoItem] = Relationship(sa_relationship_kwargs={"cascade": "all, delete-orphan"})
