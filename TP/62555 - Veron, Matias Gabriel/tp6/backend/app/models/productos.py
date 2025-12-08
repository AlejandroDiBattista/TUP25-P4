from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=255)
    descripcion: str = Field(default="")
    precio: float = Field(default=0.0, ge=0)
    categoria: str = Field(default="", max_length=100)
    existencia: int = Field(default=0, ge=0)
    imagen: Optional[str] = Field(default=None)  # ruta de la imagen

    carrito_items: List["CarritoItem"] = Relationship(back_populates="producto")
    compra_items: List["CompraItem"] = Relationship(back_populates="producto")
