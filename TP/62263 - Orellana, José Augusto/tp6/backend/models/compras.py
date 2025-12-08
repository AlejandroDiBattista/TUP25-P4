from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, timezone

from .usuarios import Usuario

# Modelo para los ítems de compra
class ItemCompra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    # Clave foránea a la compra
    compra_id: int = Field(foreign_key="compra.id")

    # Detalles del ítem comprado (datos congelados)
    producto_id: int
    nombre: str
    cantidad: int
    precio_unitario: float

    # Relación con la compra
    compra: "Compra" = Relationship(back_populates="items")
    
# Resumen de la compra
class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    # Clave foránea al usuario que hizo la compra
    usuario_id: int = Field(foreign_key="usuario.id")

    # Datos de la compra
    fecha: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    direccion: str
    tarjeta: str # Se guardan los últimos 4 dígitos
    total: float
    envio: float # Costo de envío
    iva: float   # Total de IVA

    # Relación con el usuario
    usuario: Usuario = Relationship()

    # Relación con los ítems de compra
    items: List[ItemCompra] = Relationship(back_populates="compra")