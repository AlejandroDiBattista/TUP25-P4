from sqlmodel import SQLModel, Field, Relationship
from typing import Optional

class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_email: str = Field(foreign_key="usuario.email")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(default=1, ge=1)