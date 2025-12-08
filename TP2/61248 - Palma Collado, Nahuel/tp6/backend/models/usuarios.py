from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel


if TYPE_CHECKING:  # pragma: no cover - hints only
    from .carrito import Carrito
    from .compras import Compra


class Usuario(SQLModel, table=True):
    """Modelo de usuario final registrado en la plataforma."""

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=150)
    email: str = Field(index=True, unique=True, max_length=255)
    password_hash: str = Field(max_length=255, repr=False)
    creado_en: datetime = Field(default_factory=datetime.utcnow)

    carritos: list["Carrito"] = Relationship(back_populates="usuario")
    compras: list["Compra"] = Relationship(back_populates="usuario")
