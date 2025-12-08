from sqlmodel import Field, SQLModel
from typing import Optional

class Usuario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    email: str = Field(unique=True, index=True)
    contrasenia: str # Se almacenará el hash, no la contraseña en texto plano

    token: Optional[str] = Field(default=None, unique=True, index=True)
    token_expiration: Optional[str] = Field(default=None)