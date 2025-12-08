from typing import Optional
from sqlmodel import Field, SQLModel


class Usuario(SQLModel, table=True):
    """Modelo de Usuario para la base de datos."""
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password: str = Field()  # En producción usar hash con bcrypt
    nombre: str = Field(default="")
