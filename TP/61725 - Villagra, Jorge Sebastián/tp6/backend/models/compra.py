from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .usuario import Usuario

class Compra(SQLModel, table=True):
    """Registro de una compra finalizada."""
    __tablename__ = "compra"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)

    subtotal: float = 0.0
    iva_total: float = 0.0
    envio: float = 0.0
    total: float = 0.0
    fecha: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))  # Fecha de la compra
    nombre: str = ""
    direccion: str = ""
    telefono: str = ""
    tarjeta_mask: str = ""
    metodo_pago: str = "tarjeta"
    estado: str = "confirmada"

    usuario: Optional["Usuario"] = Relationship(back_populates="compras")
    items: List["CompraItem"] = Relationship(
        back_populates="compra",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )

class CompraItem(SQLModel, table=True):
    """Detalle inmóvil de productos vendidos dentro de una compra."""
    __tablename__ = "compra_item"

    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id", index=True)
    producto_id: int = Field(foreign_key="producto.id", index=True)

    cantidad: int = 1
    precio_unit: float = 0.0
    subtotal: float = 0.0

    # Campos denormalizados
    titulo: str = ""
    imagen: Optional[str] = None
    categoria: Optional[str] = None
    iva_rate: float = 0.0

    compra: Optional["Compra"] = Relationship()
