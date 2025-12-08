from typing import Optional
from sqlmodel import SQLModel, Field
from pydantic import EmailStr

class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: EmailStr = Field(index=True, unique=True)
    password_hash: str

class UsuarioCreate(SQLModel):
    nombre: str
    email: EmailStr
    password: str

class UsuarioRead(SQLModel):
    id: int
    nombre: str
    email: EmailStr
