from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship

# --- DEFINIMOS TODOS LOS MODELOS AQUÍ ---

class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    descripcion: str
    precio: float
    categoria: str = Field(index=True)
    existencia: int

    # --- AQUÍ ESTÁN LAS RELACIONES ---
    items_carrito: List["ItemCarrito"] = Relationship(back_populates="producto")
    items_compra: List["ItemCompra"] = Relationship(back_populates="producto")

class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: str = Field(unique=True)
    password_hash: str
    carritos: List["Carrito"] = Relationship(back_populates="usuario")
    compras: List["Compra"] = Relationship(back_populates="usuario")

class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: str = Field(default="activo")  # activo, finalizado, cancelado
    usuario: Usuario = Relationship(back_populates="carritos")
    items: List["ItemCarrito"] = Relationship(back_populates="carrito") 

class ItemCarrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int
    carrito: Carrito = Relationship(back_populates="items")
    producto: Producto = Relationship(back_populates="items_carrito")

class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha: datetime = Field(default_factory=datetime.now)
    direccion: str
    tarjeta: str
    total: float
    envio: float
    usuario: Usuario = Relationship(back_populates="compras")
    items: List["ItemCompra"] = Relationship(back_populates="compra")

class ItemCompra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int
    nombre: str
    precio_unitario: float
    compra: Compra = Relationship(back_populates="items")
    producto: Producto = Relationship(back_populates="items_compra")