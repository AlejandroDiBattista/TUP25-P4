from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

if TYPE_CHECKING:
    from .usuarios import Usuario

class CompraItem(SQLModel, table=True):
    __tablename__ = "compra_item"
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(ge=1)
    nombre: str = Field(max_length=255)  # Guardamos el nombre del producto al momento de la compra
    precio_unitario: float = Field(ge=0)
    
    compra: "Compra" = Relationship(back_populates="items")

class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha: datetime = Field(default_factory=datetime.now)
    direccion: str = Field(max_length=500)
    tarjeta: str = Field(max_length=4)  # Últimos 4 dígitos
    total: float = Field(ge=0)
    envio: float = Field(ge=0)
    
    usuario: "Usuario" = Relationship(back_populates="compras")
    items: List[CompraItem] = Relationship(back_populates="compra")