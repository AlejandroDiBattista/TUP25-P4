from typing import Optional
from sqlmodel import Field, SQLModel


class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: str = Field(index=True)
    hashed_password: str


class UsuarioCreate(SQLModel):
    nombre: str
    email: str
    password: str


class UsuarioRead(SQLModel):
    id: int
    nombre: str
    email: str

    class Config:
        orm_mode = True
