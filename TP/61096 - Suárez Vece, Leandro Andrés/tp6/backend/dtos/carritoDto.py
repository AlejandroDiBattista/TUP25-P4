from sqlmodel import SQLModel, Field
from pydantic import conint # Para forzar valores enteros positivos
from models.productos import Producto


class CarritoAdd(SQLModel):
    """Modelo para agregar un producto al carrito."""
    producto_id: int = Field(gt=0)
    cantidad: conint(strict=True, gt=0) # conint asegura que es int y > 0


class CarritoRead(SQLModel):
    """Representación del ítem del carrito para la respuesta de la API."""
    cantidad: int
    producto: Producto