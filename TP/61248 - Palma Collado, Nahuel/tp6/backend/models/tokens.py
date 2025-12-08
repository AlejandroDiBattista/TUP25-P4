from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class TokenRevocado(SQLModel, table=True):
    """Lista de tokens invalidados tras cerrar sesión."""

    id: Optional[int] = Field(default=None, primary_key=True)
    jti: str = Field(index=True, unique=True, max_length=255)
    usuario_id: int = Field(foreign_key="usuario.id")
    revocado_en: datetime = Field(default_factory=datetime.utcnow)
    expira_en: datetime = Field()
