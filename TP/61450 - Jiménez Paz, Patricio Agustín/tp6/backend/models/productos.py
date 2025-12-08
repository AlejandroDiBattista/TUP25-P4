from typing import Optional
from sqlmodel import Field, SQLModel


class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str = Field(max_length=255)
    precio: float = Field(ge=0, default=0.0)
    descripcion: str = Field(default="")
    categoria: str = Field(default="", max_length=100)
    valoracion: float = Field(ge=0, le=5, default=5.0)
    existencia: int = Field(ge=0, default=0)
    imagen: str = Field(default="")
