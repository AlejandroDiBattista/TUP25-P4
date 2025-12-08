from sqlmodel import SQLModel
from datetime import datetime
from typing import List, Optional
# Importamos el schema del carrito para reusarlo (ya que tiene subtotal y nombre formateado)
from schemas.carrito_schema import ItemCarritoResponse

# Input: Lo que el usuario envía al finalizar
class CompraCreate(SQLModel):
    direccion: str
    tarjeta: str

# Output: Lo que la API devuelve al ver el detalle
class CompraResponse(SQLModel):
    id: int
    usuario_id: int
    fecha: datetime
    direccion: str
    total: float
    envio: float
    # --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
    # Ahora usamos ItemCarritoResponse para que coincida con el servicio
    items: List[ItemCarritoResponse] 
    # ---

# Resumen para la lista
class CompraResumenResponse(SQLModel):
    id: int
    fecha: datetime
    total: float
    cantidad_items: int