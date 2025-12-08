from typing import Optional

from sqlmodel import Field, SQLModel


class Producto(SQLModel, table=True):
    """Entidad de producto disponible para la venta."""

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    descripcion: Optional[str] = None
    precio: float = 0
    categoria: Optional[str] = None
    valoracion: Optional[float] = None
    existencia: int = 0
    imagen: Optional[str] = None