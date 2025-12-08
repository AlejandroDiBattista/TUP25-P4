from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

class Usuario(SQLModel, table=True):
    """Modelo de Usuario"""
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    apellido: str = Field(max_length=100)
    email: str = Field(max_length=255, unique=True, index=True)
    password_hash: str = Field(max_length=255)
    telefono: Optional[str] = Field(default=None, max_length=20)
    direccion: Optional[str] = Field(default=None, max_length=500)
    fecha_registro: datetime = Field(default_factory=datetime.now)
    activo: bool = Field(default=True)

class UsuarioRegistro(SQLModel):
    """Modelo para registro de usuario"""
    nombre: str = Field(min_length=2, max_length=100)
    apellido: str = Field(min_length=2, max_length=100)
    email: str = Field(max_length=255)
    password: str = Field(min_length=6, max_length=50)
    telefono: Optional[str] = None
    direccion: Optional[str] = None

class UsuarioLogin(SQLModel):
    """Modelo para login de usuario"""
    email: str
    password: str

class UsuarioPublico(SQLModel):
    """Modelo público para respuestas de API"""
    id: int
    nombre: str
    apellido: str
    email: str
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    fecha_registro: datetime

class Token(SQLModel):
    """Modelo para tokens de autenticación"""
    access_token: str
    token_type: str = "bearer"

class UsuarioRegistro(SQLModel):
    """Modelo para registro de usuario"""
    nombre: str = Field(min_length=2, max_length=100)
    apellido: str = Field(min_length=2, max_length=100)
    email: str = Field(max_length=255)
    password: str = Field(min_length=6, max_length=50)
    telefono: Optional[str] = None
    direccion: Optional[str] = None

class UsuarioLogin(SQLModel):
    """Modelo para login de usuario"""
    email: str
    password: str

class UsuarioPublico(SQLModel):
    """Modelo público para respuestas de API"""
    id: int
    nombre: str
    apellido: str
    email: str
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    fecha_registro: datetime

class Token(SQLModel):
    """Modelo para tokens de autenticación"""
    access_token: str
    token_type: str = "bearer"