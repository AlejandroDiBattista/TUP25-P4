from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: Optional[int] = Field(foreign_key="usuario.id", index=True)
    estado: str = Field(default="abierto")

    usuarios: Optional["Usuario"] = Relationship(back_populates="carrito")
    productos: List[ItemCarrito] = Relationship()

class ItemCarrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id", index=True)
    producto_id: int = Field(foreign_key="producto.id", index=True)
    cantidad: int = Field(default=1, ge=1)