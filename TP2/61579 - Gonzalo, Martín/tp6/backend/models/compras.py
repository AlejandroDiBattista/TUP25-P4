from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

# --- Modelo para el Carrito ---

class CarritoItem(SQLModel, table=True):
    """
    Modelo para un item en el carrito de compras de un usuario.
    Esta tabla se vacía (o se borran sus items) cuando el usuario
    finaliza la compra.
    """
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Relación con el Usuario: A quién le pertenece este item
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    
    # Relación con el Producto: Qué producto es
    producto_id: int = Field(foreign_key="producto.id")
    
    # Cuántas unidades de este producto
    cantidad: int = Field(gt=0) # gt=0 (Greater Than 0), no se pueden agregar 0 o menos


# --- Modelos para el Historial de Compras ---

class Compra(SQLModel, table=True):
    """
    Modelo para una compra (orden) finalizada.
    Esta es la cabecera de la orden.
    """
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Relación con el Usuario: Quién realizó esta compra
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    
    # default_factory=datetime.now: Pone la fecha y hora actual
    # automáticamente cuando se crea una nueva compra en la BBDD.
    fecha: datetime = Field(default_factory=datetime.now, index=True)
    
    direccion: str = Field()
    
    total: float = Field()
    # Este será el precio final calculado (productos + iva + envío)


class CompraItem(SQLModel, table=True):
    """
    Modelo para un item específico dentro de una compra finalizada.
    Este es el detalle de la orden.
    """
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Relación con la Compra: A qué compra pertenece este item
    compra_id: int = Field(foreign_key="compra.id", index=True)
    
    # Relación con el Producto: Qué producto se compró
    producto_id: int = Field(foreign_key="producto.id")
    
    cantidad: int = Field()
    
    precio_unitario: float = Field()
    # ¡MUY IMPORTANTE! Guardamos el precio al momento de la compra.
    # Hacemos esto por si el precio del producto en la tabla 'Producto'
    # cambia en el futuro, el historial de la compra no se verá afectado.