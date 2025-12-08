from sqlmodel import SQLModel, Field
from pydantic import EmailStr
from typing import Optional


class UsuarioRegister(SQLModel):
    """Datos necesarios para crear una cuenta (incluye la contraseña plana)."""
    nombre: str = Field(max_length=100)
    email: EmailStr
    password: str 

class UsuarioLogin(SQLModel):
    """Credenciales para iniciar sesión."""
    email: EmailStr
    password: str


class Token(SQLModel):
    """Estructura de la respuesta con el JWT."""
    access_token: str
    token_type: str = "bearer"

