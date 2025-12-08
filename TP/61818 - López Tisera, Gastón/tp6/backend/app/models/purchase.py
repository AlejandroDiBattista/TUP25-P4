from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class Purchase(SQLModel, table=True):
    """Registro de compra finalizada."""

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="user.id", index=True)
    fecha: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    direccion: str
    tarjeta: str
    envio: float
    total: float

    items: list["PurchaseItem"] = Relationship(
        back_populates="compra",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class PurchaseItem(SQLModel, table=True):
    """Detalle de un producto dentro de una compra."""

    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="purchase.id", index=True)
    producto_id: int = Field(foreign_key="product.id")
    nombre: str
    cantidad: int = Field(ge=1)
    precio_unitario: float = Field(ge=0)

    compra: Optional[Purchase] = Relationship(back_populates="items")

