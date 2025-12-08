from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(default="", max_length=100)
    email: str = Field(default="", max_length=125, unique=True, index=True)
    contraseña: str = Field(default="")

    compras: List["Compra"] = Relationship(back_populates="usuarios")
    carrito: Optional["Carrito"] = Relationship(back_populates="usuarios")