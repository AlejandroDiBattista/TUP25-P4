from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional

from pydantic import EmailStr
from sqlalchemy import Column, String
from sqlmodel import Field, Relationship, SQLModel


class CarritoEstado(str, Enum):
    ABIERTO = "abierto"
    FINALIZADO = "finalizado"
    CANCELADO = "cancelado"


class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100, index=True)
    email: EmailStr = Field(sa_column=Column("email", String, unique=True, index=True))
    password_hash: str = Field(max_length=128)

    carritos: List["Carrito"] = Relationship(back_populates="usuario")
    compras: List["Compra"] = Relationship(back_populates="usuario")


class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str = Field(max_length=255, index=True)
    descripcion: str
    precio: float = Field(ge=0)
    categoria: str = Field(max_length=100, index=True)
    valoracion: float = Field(default=0, ge=0, le=5)
    existencia: int = Field(default=0, ge=0)
    imagen: str = Field(max_length=255)

    carrito_items: List["CarritoItem"] = Relationship(back_populates="producto")
    compra_items: List["CompraItem"] = Relationship(back_populates="producto")


class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    estado: CarritoEstado = Field(default=CarritoEstado.ABIERTO)
    creado_en: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    actualizado_en: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    usuario: Optional[Usuario] = Relationship(back_populates="carritos")
    items: List["CarritoItem"] = Relationship(back_populates="carrito")


class CarritoItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id", index=True)
    producto_id: int = Field(foreign_key="producto.id", index=True)
    cantidad: int = Field(default=1, ge=1)

    carrito: Optional[Carrito] = Relationship(back_populates="items")
    producto: Optional[Producto] = Relationship(back_populates="carrito_items")


class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    fecha: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    direccion: str = Field(max_length=200)
    tarjeta_final: str = Field(max_length=4)
    subtotal: float = Field(ge=0)
    iva: float = Field(ge=0)
    envio: float = Field(ge=0)
    total: float = Field(ge=0)

    usuario: Optional[Usuario] = Relationship(back_populates="compras")
    items: List["CompraItem"] = Relationship(back_populates="compra")


class CompraItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id", index=True)
    producto_id: int = Field(foreign_key="producto.id")
    nombre: str = Field(max_length=255)
    precio_unitario: float = Field(ge=0)
    cantidad: int = Field(ge=1)

    compra: Optional[Compra] = Relationship(back_populates="items")
    producto: Optional[Producto] = Relationship(back_populates="compra_items")
