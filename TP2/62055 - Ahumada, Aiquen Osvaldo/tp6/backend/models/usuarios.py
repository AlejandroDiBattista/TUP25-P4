from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from uuid import uuid4

class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(default="", max_length=255)
    email: str = Field(index=True, nullable=False, max_length=255)
    hashed_password: str = Field(default="", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UsuarioCreate(SQLModel):
    nombre: str
    email: str
    password: str

class SessionToken(SQLModel, table=True):
    """
    Sessions simples: guardamos token (uuid) asociado a user_id.
    El token es lo que el frontend usa como 'access_token'.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    token: str = Field(default_factory=lambda: str(uuid4()), index=True, nullable=False)
    user_id: int = Field(nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(nullable=False)  # Nuevo campo para la expiración del token
