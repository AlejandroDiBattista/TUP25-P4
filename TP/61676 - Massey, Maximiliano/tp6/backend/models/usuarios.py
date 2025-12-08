from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .carrito import ItemCarrito
    from .compras import Compra

class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    email: str = Field(unique=True, max_length=255)
    password_hash: str = Field(max_length=255)
    
    # Relaciones
    compras: List["Compra"] = Relationship(back_populates="usuario")
    carrito: List["ItemCarrito"] = Relationship(back_populates="usuario")