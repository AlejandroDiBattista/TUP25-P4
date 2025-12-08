from typing import Optional
from sqlmodel import Field, SQLModel


class Producto(SQLModel, table=True):
    """Modelo de Producto para la base de datos.
    
    TODO: Implementar los campos necesarios según las especificaciones.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(default="", max_length=255)
    descripcion: str = Field(default="")
    precio: float = Field(default=0.0, ge=0)
    categoria: str = Field(default="", max_length=100)
    existencia: int = Field(default=0, ge=0)
    imagen: str = Field(default="")


# Modelo de Usuario
class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: str
    password: str

# Modelo de Carrito
class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int
    estado: str = Field(default="activo")

# Modelo de CarritoItem
class CarritoItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int
    producto_id: int
    cantidad: int


# Modelo de Compra
class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int
    fecha: str
    direccion_envio: str = ""
    metodo_pago: str = ""
    total_productos: float = 0.0
    total_iva: float = 0.0
    costo_envio: float = 0.0
    total_final: float = 0.0


# Modelo de CompraItem
class CompraItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    compra_id: int
    producto_id: int
    nombre_producto_snapshot: str = ""
    precio_unitario_snapshot: float = 0.0
    cantidad: int