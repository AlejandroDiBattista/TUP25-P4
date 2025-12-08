from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List

class Compra(SQLModel, table=True):
    """Modelo para almacenar las compras realizadas"""
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    fecha: datetime = Field(default_factory=datetime.utcnow)
    total: float
    estado: str = Field(default="completada")  # completada, cancelada
    
    # Datos de envío
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    codigo_postal: Optional[str] = None
    telefono: Optional[str] = None
    
    # Relaciones
    usuario: Optional["Usuario"] = Relationship(back_populates="compras")
    items: List["CompraItem"] = Relationship(back_populates="compra", cascade_delete=True)

class CompraItem(SQLModel, table=True):
    """Modelo para los items individuales de cada compra"""
    __tablename__ = "compra_item"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int = Field(foreign_key="compra.id", index=True)
    producto_id: int
    producto_titulo: str
    producto_imagen: str
    producto_categoria: str
    cantidad: int
    precio_unitario: float
    subtotal: float
    
    # Relación
    compra: Optional["Compra"] = Relationship(back_populates="items")

# Schemas para request/response
class CompraItemCreate(SQLModel):
    """Schema para crear un item de compra"""
    producto_id: int
    cantidad: int

class CompraCreate(SQLModel):
    """Schema para crear una compra"""
    items: List[CompraItemCreate]
    direccion: str
    ciudad: str
    codigo_postal: str
    telefono: str

class CompraItemResponse(SQLModel):
    """Schema para respuesta de item de compra"""
    id: int
    producto_id: int
    producto_titulo: str
    producto_imagen: str
    producto_categoria: str
    cantidad: int
    precio_unitario: float
    subtotal: float

class CompraResponse(SQLModel):
    """Schema para respuesta de compra"""
    id: int
    usuario_id: int
    fecha: datetime
    total: float
    estado: str
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    codigo_postal: Optional[str] = None
    telefono: Optional[str] = None
    items: List[CompraItemResponse]
