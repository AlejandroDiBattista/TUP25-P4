from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel


if TYPE_CHECKING:  # pragma: no cover - hints only
    from .productos import Producto
    from .usuarios import Usuario


class EstadoCarrito(str, Enum):
    ABIERTO = "abierto"
    FINALIZADO = "finalizado"
    CANCELADO = "cancelado"


class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: EstadoCarrito = Field(default=EstadoCarrito.ABIERTO)
    creado_en: datetime = Field(default_factory=datetime.utcnow)
    actualizado_en: datetime = Field(default_factory=datetime.utcnow)

    usuario: "Usuario" = Relationship(back_populates="carritos")
    items: list["CarritoItem"] = Relationship(
        back_populates="carrito",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class CarritoItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(default=1, ge=1)

    carrito: Carrito = Relationship(back_populates="items")
    producto: "Producto" = Relationship()