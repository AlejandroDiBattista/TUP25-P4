from typing import Optional
from sqlmodel import Field, SQLModel


class Producto(SQLModel, table=True):
    """Modelo de Producto para la base de datos"""
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str = Field(index=True)
    precio: float
    descripcion: str
    categoria: str = Field(index=True)
    valoracion: float
    existencia: int
    imagen: str

    class Config:
        table_name = "productos" 