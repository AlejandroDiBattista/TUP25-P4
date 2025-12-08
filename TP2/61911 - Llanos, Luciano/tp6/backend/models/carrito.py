from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

class Carrito(SQLModel, table=True):
    """Modelo de Carrito de Compras"""
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha_creacion: datetime = Field(default_factory=datetime.now)
    fecha_actualizacion: datetime = Field(default_factory=datetime.now)
    activo: bool = Field(default=True)
    
    # Relaciones
    items: List["CarritoItem"] = Relationship(back_populates="carrito")

class CarritoItem(SQLModel, table=True):
    """Modelo de Item del Carrito"""
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(ge=1)  # Mayor o igual a 1
    precio_unitario: float = Field(ge=0)  # Precio al momento de agregar
    fecha_agregado: datetime = Field(default_factory=datetime.now)
    
    # Relaciones
    carrito: Optional[Carrito] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship()

# ===============================================
# MODELOS DE RESPUESTA PARA API
# ===============================================

class CarritoItemPublico(SQLModel):
    """Modelo público para items del carrito"""
    id: int
    producto_id: int
    cantidad: int
    precio_unitario: float
    subtotal: float
    fecha_agregado: datetime
    
    # Información del producto
    producto_nombre: str
    producto_imagen: str

class CarritoPublico(SQLModel):
    """Modelo público para respuesta del carrito"""
    id: int
    usuario_id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    items: List[CarritoItemPublico]
    total_items: int
    total_precio: float

class AgregarItemCarrito(SQLModel):
    """Modelo para agregar item al carrito"""
    producto_id: int = Field(ge=1)
    cantidad: int = Field(ge=1, le=10)  # Máximo 10 unidades por item

class ActualizarItemCarrito(SQLModel):
    """Modelo para actualizar cantidad de item"""
    cantidad: int = Field(ge=1, le=10)

class CarritoResumen(SQLModel):
    """Modelo de resumen del carrito"""
    total_items: int
    total_precio: float
    cantidad_productos: int