"""
Modelo de Usuario para la base de datos.

Define la estructura de usuarios registrados en el sistema,
incluyendo autenticación mediante tokens.
"""
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

if TYPE_CHECKING:
    from .carrito import Carrito
    from .compra import Compra


class Usuario(SQLModel, table=True):
    """Modelo de Usuario para la base de datos.
    
    Almacena la información de los usuarios registrados.
    La contraseña se guarda hasheada (nunca en texto plano).
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=255)
    fecha_registro: datetime = Field(default_factory=datetime.utcnow)
    activo: bool = Field(default=True)
    
    # Campos para autenticación por token
    token: Optional[str] = Field(default=None, max_length=64)
    token_expiration: Optional[datetime] = Field(default=None)
    
    # Relaciones
    carritos: list["Carrito"] = Relationship(back_populates="usuario")
    compras: list["Compra"] = Relationship(back_populates="usuario")


# ==================== SCHEMAS ====================

class UsuarioCreate(SQLModel):
    """Schema para crear un nuevo usuario (registro)."""
    nombre: str = Field(min_length=2, max_length=100)
    email: str = Field(max_length=255)
    password: str = Field(min_length=6)


class UsuarioLogin(SQLModel):
    """Schema para login de usuario."""
    email: str
    password: str


class UsuarioResponse(SQLModel):
    """Schema para respuesta de usuario (sin password ni token)."""
    id: int
    nombre: str
    email: str
    fecha_registro: datetime
    activo: bool


class TokenResponse(SQLModel):
    """Schema para respuesta de login exitoso."""
    access_token: str
    usuario: UsuarioResponse
