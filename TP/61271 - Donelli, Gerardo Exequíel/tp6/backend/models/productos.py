from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship, JSON, Column
from datetime import datetime
import json


class Usuario(SQLModel, table=True):
    """Modelo de Usuario para la base de datos."""
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=255)
    email: str = Field(unique=True, index=True, max_length=255)
    password: str = Field(max_length=255)  # Contraseña hasheada
    
    # Relaciones
    carritos: List["Carrito"] = Relationship(back_populates="usuario")
    compras: List["Compra"] = Relationship(back_populates="usuario")


class Producto(SQLModel, table=True):
    """Modelo de Producto para la base de datos."""
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str = Field(max_length=255)
    precio: float = Field(ge=0)
    descripcion: str
    categoria: str = Field(max_length=100)
    valoracion: float = Field(default=0.0, ge=0, le=5)
    existencia: int = Field(ge=0)
    imagen: str = Field(max_length=500)


class ItemCarrito(SQLModel, table=True):
    """Modelo de Item del Carrito (relación entre Carrito y Producto)."""
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(ge=1)
    
    # Relación con Carrito
    carrito: Optional["Carrito"] = Relationship(back_populates="items")


class Carrito(SQLModel, table=True):
    """Modelo de Carrito de compras."""
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: str = Field(default="activo", max_length=50)  # activo, finalizado, cancelado
    
    # Relaciones
    usuario: Optional["Usuario"] = Relationship(back_populates="carritos")
    items: List["ItemCarrito"] = Relationship(back_populates="carrito")


class ItemCompra(SQLModel, table=True):
    """Modelo de Item de Compra (productos comprados con su información en el momento de la compra)."""
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(ge=1)
    nombre: str = Field(max_length=255)  # Nombre del producto al momento de la compra
    precio_unitario: float = Field(ge=0)  # Precio al momento de la compra
    
    # Relación con Compra
    compra: Optional["Compra"] = Relationship(back_populates="items")


class Compra(SQLModel, table=True):
    """Modelo de Compra finalizada."""
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha: datetime = Field(default_factory=datetime.now)
    direccion: str
    tarjeta: str = Field(max_length=4)  # Últimos 4 dígitos de la tarjeta
    total: float = Field(ge=0)
    envio: float = Field(ge=0)
    
    # Relaciones
    usuario: Optional["Usuario"] = Relationship(back_populates="compras")
    items: List["ItemCompra"] = Relationship(back_populates="compra") 