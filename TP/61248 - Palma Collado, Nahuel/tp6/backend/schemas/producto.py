from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class ProductoFiltro(BaseModel):
    buscar: Optional[str] = None
    categoria: Optional[str] = None


class ProductoBase(BaseModel):
    id: int
    nombre: str
    descripcion: str
    precio: float
    categoria: str
    existencia: int
    valoracion: Optional[float] = None
    imagen: Optional[str] = None

    class Config:
        from_attributes = True


ProductoListado = list[ProductoBase]
