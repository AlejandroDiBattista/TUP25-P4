from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class Usuario(SQLModel, table=True):
    """Modelo de usuario en la base de datos"""
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    fecha_creacion: datetime = Field(default_factory=datetime.now)
    
    # Relación con compras
    compras: List["Compra"] = Relationship(back_populates="usuario")

class UsuarioCreate(SQLModel):
    """Esquema para crear un usuario"""
    nombre: str
    email: str
    password: str

class UsuarioLogin(SQLModel):
    """Esquema para login"""
    email: str
    password: str

class UsuarioResponse(SQLModel):
    """Respuesta al usuario (sin password)"""
    id: int
    nombre: str
    email: str

class Token(SQLModel):
    """Respuesta con token de autenticación"""
    access_token: str
    token_type: str
    usuario: UsuarioResponse
