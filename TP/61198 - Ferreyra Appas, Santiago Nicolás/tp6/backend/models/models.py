
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


# =========================
# MODELOS DE BASE DE DATOS
# =========================


class Cliente(SQLModel, table=True):
    """Tabla de usuarios del sistema"""
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    correo: str = Field(max_length=255, unique=True, index=True)
    hash_password: str = Field(max_length=255)
    fecha_alta: datetime = Field(default_factory=datetime.utcnow)
    activo: bool = Field(default=True)

    compras: List["Orden"] = Relationship(back_populates="cliente")
    carritos: List["CarritoCompra"] = Relationship(back_populates="cliente")


class Articulo(SQLModel, table=True):
    """Tabla de productos de la tienda"""
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str = Field(max_length=255, index=True)
    descripcion: str = Field(max_length=1000)
    precio: float = Field(ge=0)
    categoria: str = Field(max_length=100, index=True)
    existencias: int = Field(default=0, ge=0)
    imagen: str = Field(max_length=255)
    es_electronico: bool = Field(default=False)


class CarritoCompra(SQLModel, table=True):
    """Carrito activo del cliente"""
    id: Optional[int] = Field(default=None, primary_key=True)
    cliente_id: int = Field(foreign_key="cliente.id")
    estado: str = Field(default="abierto")  # abierto / cerrado
    creado: datetime = Field(default_factory=datetime.utcnow)
    actualizado: datetime = Field(default_factory=datetime.utcnow)

    cliente: Optional[Cliente] = Relationship(back_populates="carritos")
    lineas: List["LineaCarrito"] = Relationship(back_populates="carrito")


class LineaCarrito(SQLModel, table=True):
    """Ítems dentro del carrito"""
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carritocompra.id")
    articulo_id: int = Field(foreign_key="articulo.id")
    cantidad: int = Field(ge=1)
    precio_unitario: float = Field(ge=0)
    agregado: datetime = Field(default_factory=datetime.utcnow)

    carrito: Optional[CarritoCompra] = Relationship(back_populates="lineas")
    articulo: Optional[Articulo] = Relationship()


class Orden(SQLModel, table=True):
    """Compra finalizada"""
    id: Optional[int] = Field(default=None, primary_key=True)
    cliente_id: int = Field(foreign_key="cliente.id")
    fecha: datetime = Field(default_factory=datetime.utcnow)
    direccion_envio: str = Field(max_length=500)
    tarjeta: str = Field(max_length=50)
    subtotal: float
    iva: float
    costo_envio: float
    total: float

    cliente: Optional[Cliente] = Relationship(back_populates="compras")
    renglones: List["LineaOrden"] = Relationship(back_populates="orden")


class LineaOrden(SQLModel, table=True):
    """Ítems de una compra"""
    id: Optional[int] = Field(default=None, primary_key=True)
    orden_id: int = Field(foreign_key="orden.id")
    articulo_id: int = Field(foreign_key="articulo.id")
    nombre_producto: str
    cantidad: int
    precio_unitario: float

    orden: Optional[Orden] = Relationship(back_populates="renglones")
