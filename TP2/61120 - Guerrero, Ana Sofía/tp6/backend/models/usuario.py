from typing import Optional
from sqlmodel import Field, SQLModel
from pydantic import EmailStr


class Usuario(SQLModel, table=True):
    """Modelo de Usuario para la base de datos."""
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(min_length=1, max_length=255)
    email: EmailStr = Field(unique=True, index=True)
    contraseña: str = Field(min_length=6)
    activo: bool = Field(default=True)


class UsuarioRegistro(SQLModel):
    """Esquema para el registro de nuevo usuario."""
    nombre: str = Field(min_length=1, max_length=255)
    email: EmailStr
    contraseña: str = Field(min_length=6)


class UsuarioRespuesta(SQLModel):
    """Esquema de respuesta del usuario (sin contraseña)."""
    id: int
    nombre: str
    email: str
    activo: bool
