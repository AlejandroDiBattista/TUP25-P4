from sqlmodel import SQLModel, Field
from typing import Optional


class ProductoRead(SQLModel):
    id: Optional[int]
    titulo: str
    descripcion: str
    precio: float
    categoria: str
    existencia: int
    imagen: str 
    agotado: Optional[bool] = None