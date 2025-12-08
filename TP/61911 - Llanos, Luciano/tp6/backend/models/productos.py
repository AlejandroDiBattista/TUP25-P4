from typing import Optional
from sqlmodel import Field, SQLModel

class Producto(SQLModel, table=True):
    """Modelo de Producto para la base de datos"""
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str = Field(max_length=255, index=True)
    precio: float = Field(ge=0)
    descripcion: str = Field(max_length=1000)
    categoria: str = Field(max_length=100, index=True)
    valoracion: Optional[float] = Field(default=None, ge=0, le=5)
    existencia: int = Field(default=0, ge=0)
    imagen: str = Field(max_length=255)

class ProductoPublico(SQLModel):
    """Modelo público para respuestas de API"""
    id: int
    titulo: str
    precio: float
    descripcion: str
    categoria: str
    valoracion: Optional[float] = None
    existencia: int
    imagen: str 