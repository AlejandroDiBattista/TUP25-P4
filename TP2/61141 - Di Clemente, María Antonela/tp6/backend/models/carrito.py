from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from .productos import Producto
from .usuarios import Usuario

class CarritoItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    producto_id: int = Field(foreign_key="producto.id")
    usuario_id: int = Field(foreign_key="usuario.id")
    cantidad: int
