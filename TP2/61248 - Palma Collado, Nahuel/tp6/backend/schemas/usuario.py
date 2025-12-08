from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class UsuarioBase(BaseModel):
    nombre: str = Field(min_length=1, max_length=150)
    email: EmailStr


class UsuarioCreate(UsuarioBase):
    password: str = Field(min_length=8, max_length=128)


class UsuarioRead(UsuarioBase):
    id: int

    class Config:
        from_attributes = True
