"""Modelo de Usuario para autenticación y registro."""

from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime


class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=255, index=True)
    email: str = Field(max_length=255, unique=True, index=True)
    contraseña_hash: str = Field(max_length=255)
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)


class UsuarioCreate(SQLModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=255)
    nombre: str = Field(min_length=1, max_length=255, default=None)


class UsuarioResponse(SQLModel):
    id: int
    nombre: str
    email: str
    fecha_creacion: datetime


class UsuarioLogin(SQLModel):
    email: str
    password: str


class AuthResponse(SQLModel):
    access_token: str
    token_type: str
    usuario: UsuarioResponse
