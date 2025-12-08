"""Modelo de Producto para el catálogo del e-commerce."""

from typing import Optional
from sqlmodel import Field, SQLModel


class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=255, index=True)
    descripcion: str
    precio: float = Field(ge=0)
    categoria: str = Field(max_length=100, index=True)
    existencia: int = Field(ge=0)
    valoracion: float = Field(default=0.0, ge=0, le=5)
    imagen: str = Field(max_length=255)


class ProductoResponse(SQLModel):
    id: int
    nombre: str
    descripcion: str
    precio: float
    categoria: str
    existencia: int
    valoracion: float
    imagen: str 