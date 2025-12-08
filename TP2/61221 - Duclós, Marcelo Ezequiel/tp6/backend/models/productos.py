from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from decimal import Decimal


class Producto(SQLModel, table=True):
    """Modelo de Producto para la base de datos."""
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str = Field(max_length=200)
    precio: Decimal = Field(decimal_places=2, max_digits=10, ge=0)
    descripcion: str = Field(max_length=1000)
    categoria: str = Field(max_length=100)
    valoracion: Optional[float] = Field(default=None)
    existencia: int = Field(default=0, ge=0)
    imagen: str = Field(max_length=255)
    
    # Relaciones
    items_carrito: List["ItemCarrito"] = Relationship(back_populates="producto")
    items_compra: List["ItemCompra"] = Relationship(back_populates="producto")
    
    @property
    def disponible(self) -> bool:
        """Verificar si el producto tiene stock disponible"""
        return self.existencia > 0
    
    @property
    def es_electronico(self) -> bool:
        """Verificar si el producto es electrónico para calcular IVA"""
        return "electrónicos" in self.categoria.lower() or "electronics" in self.categoria.lower()


class ProductoResponse(SQLModel):
    """Esquema para respuesta de producto"""
    id: int
    titulo: str
    precio: Decimal
    descripcion: str
    categoria: str
    valoracion: Optional[float]
    existencia: int
    imagen: str
    disponible: bool 