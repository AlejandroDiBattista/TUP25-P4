from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .usuarios import Usuario
    from .productos import Producto

class ItemCarrito(SQLModel, table=True):
    __tablename__ = "item_carrito"
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    producto_id: int = Field(foreign_key="producto.id") 
    cantidad: int = Field(default=1, ge=1)
    
    # Relaciones
    usuario: "Usuario" = Relationship(back_populates="carrito")
    producto: "Producto" = Relationship()