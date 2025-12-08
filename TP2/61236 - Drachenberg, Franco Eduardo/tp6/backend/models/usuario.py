from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=255)
    email: str = Field(max_length=255, unique=True, index=True)
    hashed_password: str = Field(max_length=255)

    carritos: list["Carrito"] = Relationship(back_populates="usuario")
    compras: list["Compra"] = Relationship(back_populates="usuario")
