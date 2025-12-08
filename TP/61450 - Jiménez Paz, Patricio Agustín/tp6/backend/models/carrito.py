from typing import Optional
from sqlmodel import Field, SQLModel


class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(ge=1)
