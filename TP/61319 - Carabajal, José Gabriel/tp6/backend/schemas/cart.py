from pydantic import BaseModel
from typing import List

class CartAddIn(BaseModel):
    producto_id: int
    cantidad: int = 1


class CartViewItem(BaseModel):
    producto_id: int
    nombre: str
    precio_unitario: float
    cantidad: int
    imagen: str
    stock_disponible: int
    max_cantidad: int


class CartTotals(BaseModel):
    subtotal: float
    iva: float
    envio: float
    total: float


class CartView(BaseModel):
    estado: str
    items: List[CartViewItem]
    totals: CartTotals


class FinalizarCompraIn(BaseModel):
    direccion: str
    tarjeta: str  
