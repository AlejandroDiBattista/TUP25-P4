"""
Modelo de Producto para la base de datos.

Define la estructura de productos disponibles en el e-commerce.
"""
from typing import Optional
from sqlmodel import Field, SQLModel


class Producto(SQLModel, table=True):
    """Modelo de Producto para la base de datos.
    
    Representa los productos disponibles en el e-commerce.
    Incluye validaciones y propiedades útiles para la lógica de negocio.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str = Field(max_length=255, index=True)
    descripcion: str = Field(default="")
    precio: float = Field(gt=0)  # Mayor que 0
    categoria: str = Field(max_length=100, index=True)
    valoracion: float = Field(default=0.0, ge=0, le=5)  # Entre 0 y 5
    existencia: int = Field(ge=0)  # Mayor o igual a 0
    imagen: str = Field(max_length=500)
    
    @property
    def disponible(self) -> bool:
        """Indica si el producto está disponible para compra."""
        return self.existencia > 0
    
    @property
    def es_electronico(self) -> bool:
        """Indica si el producto es electrónico (para cálculo de IVA).
        
        Los productos electrónicos tienen IVA del 10%, otros 21%.
        """
        categorias_electronicas = [
            "electrónica", "electronica", "electronics",
            "tecnología", "tecnologia", "technology"
        ]
        return self.categoria.lower() in categorias_electronicas


# ==================== SCHEMAS ====================

class ProductoResponse(SQLModel):
    """Schema para respuesta de producto."""
    id: int
    titulo: str
    descripcion: str
    precio: float
    categoria: str
    valoracion: float
    existencia: int
    imagen: str
    disponible: bool


class ProductoCreate(SQLModel):
    """Schema para crear un producto (solo admin)."""
    titulo: str = Field(min_length=3, max_length=255)
    descripcion: str
    precio: float = Field(gt=0)
    categoria: str = Field(max_length=100)
    valoracion: float = Field(default=0.0, ge=0, le=5)
    existencia: int = Field(ge=0)
    imagen: str = Field(max_length=500) 