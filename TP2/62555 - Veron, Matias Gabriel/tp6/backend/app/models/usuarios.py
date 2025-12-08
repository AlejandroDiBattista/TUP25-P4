from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=255)

    carritos: List["Carrito"] = Relationship(back_populates="usuario")
    compras: List["Compra"] = Relationship(back_populates="usuario")
