from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel
from datetime import datetime

# --- Modelos de Usuario ---

class UsuarioBase(SQLModel):
    nombre: str
    email: str

class Usuario(UsuarioBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    password_hash: str
    
    # Relaciones
    carrito: Optional["Carrito"] = Relationship(back_populates="usuario")
    compras: List["Compra"] = Relationship(back_populates="usuario")

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioRead(UsuarioBase):
    id: int

# --- Modelos de Producto ---

class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str
    descripcion: str
    precio: float
    categoria: str
    imagen: str
    existencia: int

class ProductoRead(SQLModel):
    id: int
    titulo: str
    descripcion: str
    precio: float
    categoria: str
    imagen: str
    existencia: int

# --- Modelos de Carrito ---

class ItemCarritoBase(SQLModel):
    cantidad: int
    producto_id: int = Field(foreign_key="producto.id")

class ItemCarrito(ItemCarritoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id")
    
    # Relaciones
    producto: Producto = Relationship()
    carrito: "Carrito" = Relationship(back_populates="items")

class ItemCarritoCreate(SQLModel):
    producto_id: int
    cantidad: int

class ItemCarritoRead(SQLModel):
    producto: ProductoRead
    cantidad: int

class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    
    # Relaciones
    usuario: Usuario = Relationship(back_populates="carrito")
    items: List[ItemCarrito] = Relationship(back_populates="carrito", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class CarritoRead(SQLModel):
    items: List[ItemCarritoRead]
    subtotal: float
    costo_envio: float
    iva: float
    total: float

# --- Modelos de Compra ---

class ItemCompra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int
    nombre: str
    precio_unitario: float

class CompraBase(SQLModel):
    fecha: datetime = Field(default_factory=datetime.utcnow)
    direccion: str
    tarjeta: str
    total: float
    envio: float

class Compra(CompraBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")

    # Relaciones
    usuario: Usuario = Relationship(back_populates="compras")
    items: List[ItemCompra] = Relationship(sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class CompraRead(CompraBase):
    id: int
    usuario_id: int
    items: List[ItemCompra]