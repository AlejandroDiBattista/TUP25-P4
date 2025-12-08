from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Usuario(SQLModel, table=True):
    """Modelo de usuario para la base de datos"""
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        table_name = "usuarios"
