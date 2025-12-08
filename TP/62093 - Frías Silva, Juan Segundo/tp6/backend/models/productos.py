from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str = Field(default="", max_length=255)
    nombre: str = Field(default="", max_length=255)  # Mantener compatibilidad
    descripcion: str = Field(default="")
    precio: float = Field(default=0.0, ge=0)
    categoria: str = Field(default="", max_length=100)
    existencia: int = Field(default=0, ge=0)
    imagen: str = Field(default="")
    valoracion: float = Field(default=0.0)

class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(default="", max_length=255)
    email: str = Field(default="", max_length=255, unique=True)
    contraseña_hashed: str = Field(default="")

class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: str = Field(default="activo")
    productos: List["ItemCarrito"] = Relationship(back_populates="carrito")  # Relación con ItemCarrito

class ItemCarrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(default=1, ge=1)
    carrito: Optional[Carrito] = Relationship(back_populates="productos")  # Relación inversa con Carrito

class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha: str = Field(default="")
    direccion: str = Field(default="")
    tarjeta: str = Field(default="")
    total: float = Field(default=0.0)
    envio: float = Field(default=0.0)
    items: List["ItemCompra"] = Relationship(back_populates="compra")  # Relación con ItemCompra

class ItemCompra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int = Field(foreign_key="producto.id")
    nombre: str = Field(default="")
    precio_unitario: float = Field(default=0.0)
    cantidad: int = Field(default=1, ge=1)
    compra: Optional[Compra] = Relationship(back_populates="items")  # Relación inversa con Compra