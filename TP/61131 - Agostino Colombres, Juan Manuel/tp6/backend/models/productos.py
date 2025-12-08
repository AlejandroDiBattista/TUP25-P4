from typing import Optional

from sqlmodel import Field, SQLModel


class Producto(SQLModel, table=True):
    """Información pública de un producto."""

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(default="", max_length=255, index=True)
    descripcion: str = Field(default="")
    precio: float = Field(default=0.0, ge=0)
    categoria: str = Field(default="", max_length=100, index=True)
    existencia: int = Field(default=0, ge=0)

