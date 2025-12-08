from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: str = Field(unique=True, index=True)
    password_hash: str
    fecha_creacion: datetime = Field(default_factory=datetime.now)
    activo: bool = Field(default=True)

class UsuarioCreate(SQLModel):
    nombre: str
    email: str
    password: str

class UsuarioLogin(SQLModel):
    email: str
    password: str

class UsuarioResponse(SQLModel):
    id: int
    nombre: str
    email: str
    fecha_creacion: datetime
    activo: bool