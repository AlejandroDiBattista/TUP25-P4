from typing import Optional, List
from pydantic import BaseModel, Field

class ProductoBase(BaseModel):
    nombre: str
    descripcion: str
    precio: float = Field(ge=0)
    categoria: str
    existencia: int = Field(ge=0)

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = Field(None, ge=0)
    categoria: Optional[str] = None
    existencia: Optional[int] = Field(None, ge=0)

class ProductoResponse(ProductoBase):
    id: int
    
    class Config:
        from_attributes = True

class ProductoFilter(BaseModel):
    busqueda: Optional[str] = None
    categoria: Optional[str] = None
    precio_min: Optional[float] = Field(None, ge=0)
    precio_max: Optional[float] = Field(None, ge=0)
    disponibles: Optional[bool] = None