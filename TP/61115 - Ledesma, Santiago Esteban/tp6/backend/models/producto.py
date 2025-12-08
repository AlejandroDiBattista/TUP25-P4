from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    descripcion: str
    precio: float
    categoria: str = Field(index=True)
    existencia: int
    imagen: Optional[str] = None
    valoracion: Optional[float] = None

    items_carrito: List["ItemCarrito"] = Relationship(back_populates="producto")
    items_compra: List["ItemCompra"] = Relationship(back_populates="producto")