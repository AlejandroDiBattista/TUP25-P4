from typing import Optional
from sqlmodel import Field, SQLModel


class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    precio: float = Field(default=0.0, ge=0)
    existencia: int = Field(default=0, ge=0) 
    nombre: str = Field(default="", max_length=255)
    descripcion: str = Field(default="")
    categoria: str = Field(default="", max_length=100)