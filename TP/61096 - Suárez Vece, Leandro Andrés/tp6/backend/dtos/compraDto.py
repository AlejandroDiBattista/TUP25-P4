from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import List, Optional

class CompraFinalizar(SQLModel):
    """Datos necesarios para finalizar la compra (checkout)."""
    direccion: str = Field(max_length=255)
    tarjeta: str = Field(max_length=20) # Simulación, no para producción
    # No pedimos el total, lo calcularemos en el servidor

class CompraExito(SQLModel):
    """Respuesta al finalizar la compra."""
    message: str
    compra_id: int
    total_pagado: float

class ItemCompraRead(SQLModel):
    """Representación de un producto dentro del historial de una compra."""
    nombre: str
    cantidad: int
    precio_unitario: float
    iva: float
    
class CompraResumen(SQLModel):
    """Modelo para listar todas las compras de un usuario."""
    id: int
    fecha: datetime
    total: float
    direccion: str

class CompraDetalle(CompraResumen):
    """Modelo para ver una compra en detalle."""
    envio: float
    tarjeta: str
    items: List[ItemCompraRead] 
