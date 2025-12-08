from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    email: str = Field(unique=True, index=True)
    password: str

    carritos: List["Carrito"] = Relationship(back_populates="usuario")
    compras: List["Compra"] = Relationship(back_populates="usuario")