from typing import List, Optional
from pydantic import BaseModel, Field

class ItemCarritoCreate(BaseModel):
    producto_id: int
    cantidad: int = Field(gt=0)

class ItemCarritoUpdate(BaseModel):
    cantidad: int = Field(gt=0)

# --- ¡NUEVO SCHEMA! ---
# Este schema SÍ coincide con lo que devuelve tu servicio al agregar
class ItemCarritoSimpleResponse(BaseModel):
    id: int
    producto_id: int
    cantidad: int

    class Config:
        from_attributes = True

# --- FIN DEL NUEVO SCHEMA ---


# Este schema (el complejo) lo dejamos para el GET /carrito
class ItemCarritoResponse(BaseModel):
    id: int
    producto_id: int
    cantidad: int
    nombre_producto: str
    precio_unitario: float
    subtotal: float

    class Config:
        from_attributes = True

class CarritoResponse(BaseModel):
    id: int
    estado: str
    items: List[ItemCarritoResponse] # <-- Este usa el schema complejo (¡perfecto!)
    total: float
    cantidad_items: int

    class Config:
        from_attributes = True