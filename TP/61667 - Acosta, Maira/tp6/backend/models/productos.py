from sqlmodel import SQLModel, Field
from typing import Optional

class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    descripcion: str = ""
    precio: float
    categoria: str = ""
    existencia: int = Field(default=0, ge=0)  # Usar existencia en lugar de stock
    imagen: str = ""