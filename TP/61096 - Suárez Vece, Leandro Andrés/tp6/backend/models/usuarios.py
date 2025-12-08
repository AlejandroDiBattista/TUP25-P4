from typing import Optional, List
from sqlmodel import Field, SQLModel,Relationship
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from models.carrito import Carrito
    from models.compras import Compra


class Usuario(SQLModel, table=True):
    """Modelo de Usuario para la base de datos."""
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    email: str = Field(max_length=255, unique=True)
    hashed_password: str = Field(max_length=255)

    carritos: List["Carrito"] = Relationship(back_populates="usuario")
    compras: List["Compra"] = Relationship(back_populates="usuario")
