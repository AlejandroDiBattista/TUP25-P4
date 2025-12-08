from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    """Modelo de usuario."""

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    email: str = Field(index=True, unique=True, max_length=255)
    hashed_password: str = Field(max_length=255)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

