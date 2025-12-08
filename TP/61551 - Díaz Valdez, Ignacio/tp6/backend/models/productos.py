from typing import Optional
from sqlmodel import Field, SQLModel


class Producto(SQLModel, table=True):
    """Modelo de Producto para la base de datos.

    Incluye campos usados por el frontend (titulo, imagen, valoracion)
    y los del enunciado (nombre). Podés usar 'titulo' como principal y
    'nombre' como alias opcional.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str = Field(default="", max_length=255)
    # alias opcional según enunciado
    nombre: Optional[str] = Field(default=None, max_length=255)
    descripcion: str = Field(default="")
    precio: float = Field(default=0.0, ge=0)
    categoria: str = Field(default="", max_length=100)
    existencia: int = Field(default=0, ge=0)
    valoracion: Optional[float] = Field(default=None)
    imagen: Optional[str] = Field(default=None, max_length=255)