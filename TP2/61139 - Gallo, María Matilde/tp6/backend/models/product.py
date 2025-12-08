from sqlmodel import SQLModel, Field
from typing import Optional

class Product(SQLModel, table=True):
    __tablename__ = "products"
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str
    descripcion: str
    precio: float
    categoria: str
    valoracion: float
    existencia: int
    imagen: str

