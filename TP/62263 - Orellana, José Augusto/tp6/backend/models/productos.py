from typing import Optional
from sqlmodel import Field, SQLModel


class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    titulo: str = Field(default="", max_length=255)
    descripcion: str = Field(default="")
    precio: float = Field(default=0.0, ge=0)
    categoria: str = Field(default="", max_length=100)
    existencia: int = Field(default=0, ge=0)
    imagen: str = Field(default="")
    valoracion: float = Field(default=0.0)