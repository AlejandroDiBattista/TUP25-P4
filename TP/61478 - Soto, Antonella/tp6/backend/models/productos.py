from typing import Optional
from sqlmodel import Field, SQLModel


class Producto(SQLModel, table=True):
    """Modelo de Producto para la base de datos.
    
    TODO: Implementar los campos necesarios según las especificaciones.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    descripcion: Optional[str] = None
    precio: float = 0.0
    categoria: Optional[str] = None
    existencia: int = 0