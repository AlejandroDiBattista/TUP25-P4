"""Modelos de datos (SQLModel) para el TP6.

Se definen todos los modelos requeridos por el enunciado: Usuario, Producto,
Carrito, ItemCarrito, Compra e ItemCompra. Los nombres de campos siguen lo
especificado en el JSON y en las consignas (español y coherencia con frontend).
"""

from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


# =============================
# Usuario
# =============================
class Usuario(SQLModel, table=True):
    """Usuario: id, nombre, email (único), password hasheado y fecha de creación."""

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True, max_length=200)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str
    creado_en: datetime = Field(default_factory=datetime.utcnow)

    # Relaciones
    carritos: list["Carrito"] = Relationship(back_populates="usuario")
    compras: list["Compra"] = Relationship(back_populates="usuario")


# =============================
# Producto
# =============================
class Producto(SQLModel, table=True):
    """Producto basado en `productos.json`.

    Campos: id, titulo, descripcion, precio, categoria, valoracion, existencia, imagen
    """

    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str = Field(index=True, max_length=255)
    descripcion: str = Field(default="")
    precio: float = Field(default=0.0, ge=0)
    categoria: str = Field(default="", index=True, max_length=100)
    valoracion: float = Field(default=0.0, ge=0)
    existencia: int = Field(default=0, ge=0)
    imagen: str = Field(default="", max_length=255)

    items_carrito: list["ItemCarrito"] = Relationship(back_populates="producto")
    items_compra: list["ItemCompra"] = Relationship(back_populates="producto")


# =============================
# Carrito e ItemCarrito
# =============================
class Carrito(SQLModel, table=True):
    """Carrito: uno abierto por usuario. Estado: 'abierto' o 'cerrado'."""

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: str = Field(default="abierto", max_length=20)
    creado_en: datetime = Field(default_factory=datetime.utcnow)

    usuario: "Usuario" = Relationship(back_populates="carritos")
    items: list["ItemCarrito"] = Relationship(back_populates="carrito")


class ItemCarrito(SQLModel, table=True):
    """Ítem del carrito con cantidad y precio unitario cacheado."""

    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(default=1, ge=1)
    precio_unitario: float = Field(default=0.0, ge=0)

    carrito: "Carrito" = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="items_carrito")


# =============================
# Compra e ItemCompra
# =============================
class Compra(SQLModel, table=True):
    """Compra finalizada con resumen de importes."""

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha: datetime = Field(default_factory=datetime.utcnow)
    direccion: str
    tarjeta: str  # almacenada enmascarada
    subtotal: float
    iva: float
    envio: float
    total: float

    usuario: "Usuario" = Relationship(back_populates="compras")
    items: list["ItemCompra"] = Relationship(back_populates="compra")


class ItemCompra(SQLModel, table=True):
    """Item de una compra."""

    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(ge=1)
    precio_unitario: float = Field(ge=0)

    compra: "Compra" = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="items_compra")


# =============================
# Utilidades simples
# =============================
def obtener_aliquota_iva(categoria: str) -> float:
    """Devuelve la alícuota de IVA según la categoría.

    - Electrónica: 10%
    - Resto: 21%
    """

    return 0.10 if categoria.strip().lower().startswith("electr") else 0.21
