from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    carrito_id: Optional[int] = Field(foreign_key="carrito.id", default=None)
    fecha: datetime = Field(default_factory=datetime.utcnow)
    direccion: str = Field(max_length=255)
    tarjeta: str = Field(description="Últimos 4 dígitos", max_length=4)
    subtotal: float = Field(default=0, ge=0)
    iva: float = Field(default=0, ge=0)
    envio: float = Field(default=0, ge=0)
    total: float = Field(default=0, ge=0)

    usuario: "Usuario" = Relationship(back_populates="compras")
    items: list["CompraItem"] = Relationship(
        back_populates="compra",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class CompraItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int
    nombre: str
    cantidad: int = Field(ge=1)
    precio_unitario: float = Field(ge=0)
    categoria: str = Field(default="", max_length=100)
    imagen: Optional[str] = Field(default=None, max_length=255)

    compra: Compra = Relationship(back_populates="items")


if TYPE_CHECKING:  # pragma: no cover - hints only
    from .carrito import Carrito
    from .usuarios import Usuario