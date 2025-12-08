from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime


# ==================== MODELO USUARIO ====================
class Usuario(SQLModel, table=True):
    """Modelo de Usuario para autenticación y gestión de compras."""
    __tablename__ = "usuarios"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=255)
    email: str = Field(unique=True, index=True, max_length=255)
    contraseña: str = Field(max_length=255)  # Hash de contraseña
    
    # Relaciones
    carritos: List["Carrito"] = Relationship(back_populates="usuario")
    compras: List["Compra"] = Relationship(back_populates="usuario")


# ==================== MODELO PRODUCTO ====================
class Producto(SQLModel, table=True):
    """Modelo de Producto para el catálogo."""
    __tablename__ = "productos"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=255)
    descripcion: str = Field(default="")
    precio: float = Field(ge=0)
    categoria: str = Field(max_length=100)
    existencia: int = Field(ge=0)
    imagen: str = Field(default="", max_length=500)


# ==================== MODELO ITEM CARRITO ====================
class ItemCarrito(SQLModel, table=True):
    """Modelo de Item del Carrito."""
    __tablename__ = "items_carrito"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carritos.id", ondelete="CASCADE")
    producto_id: int = Field(foreign_key="productos.id")
    cantidad: int = Field(ge=1)
    
    carrito: "Carrito" = Relationship(back_populates="items")


# ==================== MODELO CARRITO ====================
class Carrito(SQLModel, table=True):
    """Modelo de Carrito de compras."""
    __tablename__ = "carritos"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id")
    estado: str = Field(default="activo", max_length=50)
    
    usuario: Usuario = Relationship(back_populates="carritos")
    items: List[ItemCarrito] = Relationship(
        back_populates="carrito",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


# ==================== MODELO ITEM COMPRA ====================
class ItemCompra(SQLModel, table=True):
    """Modelo de Item de Compra."""
    __tablename__ = "items_compra"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compras.id", ondelete="CASCADE")
    producto_id: int = Field(foreign_key="productos.id")
    cantidad: int = Field(ge=1)
    nombre: str = Field(max_length=255)
    precio_unitario: float = Field(ge=0)
    
    compra: "Compra" = Relationship(back_populates="items")


# ==================== MODELO COMPRA ====================
class Compra(SQLModel, table=True):
    """Modelo de Compra finalizada."""
    __tablename__ = "compras"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id")
    fecha: datetime = Field(default_factory=datetime.utcnow)
    direccion: str = Field(max_length=500)
    tarjeta: str = Field(max_length=100)
    total: float = Field(ge=0)
    envio: float = Field(ge=0)
    
    usuario: Usuario = Relationship(back_populates="compras")
    items: List[ItemCompra] = Relationship(
        back_populates="compra",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
