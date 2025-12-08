from typing import Optional

from sqlalchemy import Column, String
from sqlmodel import Field, SQLModel


class Usuario(SQLModel, table=True):
    """Representa a un usuario del sistema de e-commerce."""

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(default="", max_length=100, index=True)
    email: str = Field(
        default="",
        sa_column=Column("email", String(100), unique=True, index=True, nullable=False),
    )
    hashed_password: str = Field(default="", max_length=255)


