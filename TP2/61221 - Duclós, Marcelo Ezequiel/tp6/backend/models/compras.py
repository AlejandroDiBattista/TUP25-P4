from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class Compra(SQLModel, table=True):
    """Modelo de compra finalizada"""
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha: datetime = Field(default_factory=datetime.now)
    direccion: str = Field(max_length=500)
    tarjeta: str = Field(max_length=20)  # Últimos 4 dígitos enmascarados
    subtotal: Decimal = Field(decimal_places=2, max_digits=10)
    descuento: Decimal = Field(decimal_places=2, max_digits=10, default=0)
    iva: Decimal = Field(decimal_places=2, max_digits=10)
    envio: Decimal = Field(decimal_places=2, max_digits=10)
    total: Decimal = Field(decimal_places=2, max_digits=10)
    
    # Relaciones
    usuario: Optional["Usuario"] = Relationship(back_populates="compras")
    items: List["ItemCompra"] = Relationship(back_populates="compra", cascade_delete=True)
    
    @property
    def total_items(self) -> int:
        """Total de items en la compra"""
        return sum(item.cantidad for item in self.items)

class ItemCompra(SQLModel, table=True):
    """Items de una compra específica (snapshot del producto al momento de compra)"""
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(gt=0)
    nombre: str = Field(max_length=200)  # Nombre del producto al momento de compra
    precio_unitario: Decimal = Field(decimal_places=2, max_digits=10)  # Precio al momento de compra
    categoria: str = Field(max_length=100)  # Para calcular IVA correcto
    
    # Relaciones
    compra: Optional["Compra"] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship(back_populates="items_compra")
    
    @property
    def subtotal(self) -> Decimal:
        """Subtotal de este item"""
        return self.precio_unitario * self.cantidad
    
    @property
    def es_electronico(self) -> bool:
        """Verificar si el producto es electrónico para calcular IVA"""
        return "electrónicos" in self.categoria.lower() or "electronics" in self.categoria.lower()
    
    @property
    def porcentaje_iva(self) -> Decimal:
        """Porcentaje de IVA según la categoría"""
        return Decimal("0.10") if self.es_electronico else Decimal("0.21")
    
    @property
    def iva_item(self) -> Decimal:
        """IVA de este item específico"""
        return self.subtotal * self.porcentaje_iva

class CompraCreate(SQLModel):
    """Esquema para crear una compra"""
    direccion: str = Field(min_length=10, max_length=500)
    tarjeta: str = Field(min_length=16, max_length=19)  # Número completo de tarjeta

class CompraResponse(SQLModel):
    """Respuesta de compra"""
    id: int
    fecha: datetime
    direccion: str
    tarjeta: str  # Solo últimos 4 dígitos
    subtotal: Decimal
    iva: Decimal
    envio: Decimal
    total: Decimal
    total_items: int
    items: List["ItemCompraResponse"]

class ItemCompraResponse(SQLModel):
    """Respuesta de item de compra"""
    id: int
    producto_id: int
    cantidad: int
    nombre: str
    precio_unitario: Decimal
    categoria: str
    subtotal: Decimal
    iva_item: Decimal

class CompraResumen(SQLModel):
    """Resumen de compra para listado"""
    id: int
    fecha: datetime
    total: Decimal
    total_items: int