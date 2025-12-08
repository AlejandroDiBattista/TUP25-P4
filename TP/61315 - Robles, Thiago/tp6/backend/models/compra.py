from typing import Optional
from sqlmodel import Field, SQLModel


class Compras(SQLModel, table=True):
    __tablename__ = "compras"
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: Optional[int] = Field(default=None, foreign_key="usuarios.id")
    fecha: str = Field(default=None)
    direccion: str = Field(default=None)
    tarjeta_ult4: str = Field(default=None)
    total: float = Field(default=0.0, ge=0)
    envio: float = Field(default=0.0, ge=0)
    estado: str = Field(default="procesando", max_length=50)


class CompraItem(SQLModel, table=True):
    __tablename__ = "compra_items"
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: Optional[int] = Field(default=None, foreign_key="compras.id")
    producto_id: Optional[int] = Field(default=None, foreign_key="productos.id")
    cantidad: int = Field(default=1, ge=1)
    nombre_producto: str = Field(default="", max_length=255)
    precio_unitario: float = Field(default=0.0, ge=0)
    

