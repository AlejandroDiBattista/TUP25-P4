from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

# <<<<< Modelo de Producto >>>>>>>
class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str = Field(default="", max_length=255)
    descripcion: str = Field(default="")
    precio: float = Field(default=0.0, ge=0)
    categoria: str = Field(default="", max_length=100)
    existencia: int = Field(default=0, ge=0)
    imagen: str = Field(default="")
    valoracion: float = Field(default=0.0)

    items_carrito: List["CarritoItem"] = Relationship(back_populates="producto")
    items_compra: List["CompraItem"] = Relationship(back_populates="producto")


# <<<<< Modelo de Usuario  >>>>>>
class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    email: str = Field(unique=True, index=True)
    contrasena: str

    carrito: Optional["Carrito"] = Relationship(back_populates="usuario")
    compras: List["Compra"] = Relationship(back_populates="usuario")


# <<<<<<< Modelos de Carrito >>>>>>>
class CarritoItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cantidad: int = Field(gt=0) # gt=0 significa "greater than 0"

    # Claves foráneas
    carrito_id: Optional[int] = Field(default=None, foreign_key="carrito.id")
    producto_id: Optional[int] = Field(default=None, foreign_key="producto.id")

    # Relaciones
    carrito: Optional["Carrito"] = Relationship(back_populates="productos")
    producto: Optional["Producto"] = Relationship(back_populates="items_carrito")


# <<<<< Carrito >>>>>

class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    estado: str = Field(default="activo")  # ej: 'activo', 'finalizado'

    # Clave foránea (Un carrito por usuario)
    usuario_id: Optional[int] = Field(default=None, foreign_key="usuario.id", unique=True)

    # Relaciones
    usuario: Optional["Usuario"] = Relationship(back_populates="carrito")
    productos: List["CarritoItem"] = Relationship(back_populates="carrito")


# <<<<<< Modelos de Compra >>>>>>
class CompraItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cantidad: int
    nombre: str
    precio_unitario: float

    # Claves foráneas
    compra_id: Optional[int] = Field(default=None, foreign_key="compra.id")
    producto_id: Optional[int] = Field(default=None, foreign_key="producto.id")

    # Relaciones
    compra: Optional["Compra"] = Relationship(back_populates="productos")
    producto: Optional["Producto"] = Relationship(back_populates="items_compra")


# <<<<< Compra >>>>>
class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    fecha: datetime = Field(default_factory=datetime.now)
    direccion: str
    tarjeta: str
    total: float
    envio: float

    # Clave foránea
    usuario_id: Optional[int] = Field(default=None, foreign_key="usuario.id")

    # Relaciones
    usuario: Optional["Usuario"] = Relationship(back_populates="compras")
    productos: List["CompraItem"] = Relationship(back_populates="compra")

#<<<<< Modelos de la API >>>>>
class UsuarioCreate(SQLModel):
    nombre: str
    email: str
    password: str

class UsuarioRead(SQLModel):
    id: int
    nombre: str
    email: str

class UsuarioLogin(SQLModel):
    email: str
    password: str

# <<<< Modelo p/la respuesta del token >>>>>
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"

# <<<< Modelo p/los datos contenidos en el token >>>>>
class TokenData(SQLModel):
    email: str | None = None

class CarritoItemCreate(SQLModel):
    producto_id: int
    cantidad: int

class CarritoItemRead(SQLModel):
    cantidad: int
    producto: Producto

class CarritoRead(SQLModel):
    id: int
    estado: str
    productos: List[CarritoItemRead] = []
    subtotal: float = 0.0
    iva: float = 0.0
    envio: float = 0.0
    total: float = 0.0

class CompraCreate(SQLModel):
    direccion: str
    tarjeta: str

class CompraItemRead(SQLModel):
    cantidad: int
    nombre: str
    precio_unitario: float
    producto_id: int

class CompraRead(SQLModel):
    id: int
    fecha: datetime
    direccion: str
    tarjeta: str
    total: float
    envio: float
    usuario_id: int

    productos: List[CompraItemRead] = []