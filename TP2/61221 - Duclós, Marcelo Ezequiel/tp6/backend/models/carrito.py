from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum

class EstadoCarrito(str, Enum):
    """Estados posibles del carrito"""
    ACTIVO = "activo"
    FINALIZADO = "finalizado"
    CANCELADO = "cancelado"

class Carrito(SQLModel, table=True):
    """Modelo de carrito de compras"""
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: EstadoCarrito = Field(default=EstadoCarrito.ACTIVO)
    fecha_creacion: datetime = Field(default_factory=datetime.now)
    fecha_actualizacion: datetime = Field(default_factory=datetime.now)
    
    # Relaciones
    usuario: Optional["Usuario"] = Relationship(back_populates="carritos")
    items: List["ItemCarrito"] = Relationship(back_populates="carrito", cascade_delete=True)
    
    @property
    def total_items(self) -> int:
        """Total de items en el carrito"""
        return sum(item.cantidad for item in self.items)
    
    @property
    def subtotal(self) -> float:
        """Subtotal sin IVA ni envío"""
        return sum(float(item.subtotal) for item in self.items)

class ItemCarrito(SQLModel, table=True):
    """Items individuales del carrito"""
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(gt=0)
    fecha_agregado: datetime = Field(default_factory=datetime.now)
    
    # Relaciones
    carrito: Optional["Carrito"] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship(back_populates="items_carrito")
    
    @property
    def subtotal(self) -> float:
        """Subtotal de este item"""
        if self.producto:
            return float(self.producto.precio) * self.cantidad
        return 0.0

class ItemCarritoCreate(SQLModel):
    """Esquema para crear item en carrito"""
    producto_id: int
    cantidad: int = Field(gt=0)

class ItemCarritoUpdate(SQLModel):
    """Esquema para actualizar cantidad de item en carrito"""
    cantidad: int = Field(gt=0)

class CarritoResponse(SQLModel):
    """Respuesta del carrito completo"""
    id: int
    estado: EstadoCarrito
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    total_items: int
    subtotal: float
    items: List["ItemCarritoResponse"]

class ItemCarritoResponse(SQLModel):
    """Respuesta de item del carrito"""
    id: int
    producto_id: int
    cantidad: int
    subtotal: float
    fecha_agregado: datetime
    producto: Optional["ProductoResponse"] = None