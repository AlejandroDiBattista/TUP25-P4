from pydantic import BaseModel
from typing import Optional

class UsuarioCreate(BaseModel):
    nombre: str
    email: str
    password: str


class UsuarioLogin(BaseModel):
    email: str
    password: str


class UsuarioData(BaseModel):
    id: int
    nombre: str
    email: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[UsuarioData] = None