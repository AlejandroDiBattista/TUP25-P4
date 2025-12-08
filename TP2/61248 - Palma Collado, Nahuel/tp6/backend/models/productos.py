from typing import Optional

from sqlmodel import Field, SQLModel


class Producto(SQLModel, table=True):
    """Modelo que representa un producto disponible para la venta."""

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True, max_length=255)
    descripcion: str = Field(default="")
    precio: float = Field(default=0.0, ge=0)
    categoria: str = Field(index=True, max_length=100)
    existencia: int = Field(default=0, ge=0)
    valoracion: Optional[float] = Field(default=None, ge=0, le=5)
    imagen: Optional[str] = Field(default=None, max_length=255)