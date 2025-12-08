from typing import Optional
from sqlmodel import Field, SQLModel


class Producto(SQLModel, table=True):
    """Modelo de Producto para la base de datos."""
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(default="", max_length=255)
    titulo: str = Field(default="", max_length=255)  # Compatibilidad con JSON
    descripcion: str = Field(default="")
    precio: float = Field(default=0.0, ge=0)
    categoria: str = Field(default="", max_length=100)
    existencia: int = Field(default=0, ge=0)
    imagen: str = Field(default="", max_length=500)
    valoracion: float = Field(default=0.0, ge=0) 