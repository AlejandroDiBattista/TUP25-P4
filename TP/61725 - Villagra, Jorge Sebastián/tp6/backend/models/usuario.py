from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .carrito import Carrito
    from .compra import Compra

class Usuario(SQLModel, table=True):
    __tablename__ = "usuario"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: str = Field(index=True, unique=True)
    password_hash: str  # usando hashlib+secrets en main.py

    # Relaciones requeridas por back_populates en Carrito y Compra
    carritos: List["Carrito"] = Relationship(back_populates="usuario")
    compras: List["Compra"] = Relationship(back_populates="usuario")
