from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .compra import Compra  # noqa: F401
    from .carrito import Carrito  # noqa: F401


class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    nombre: str = ""
    password_hash: str
    # Relaciones diferidas: definimos cadenas para evitar orden circular
    compras: List["Compra"] = Relationship(back_populates="usuario")
    carrito: Optional["Carrito"] = Relationship(back_populates="usuario")
