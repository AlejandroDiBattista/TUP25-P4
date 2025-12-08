from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel


class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=255)
    email: str = Field(unique=True, index=True, max_length=255)
    password: str
    fecha_registro: datetime = Field(default_factory=datetime.now)
    token: Optional[str] = None
    token_expiracion: Optional[str] = None
