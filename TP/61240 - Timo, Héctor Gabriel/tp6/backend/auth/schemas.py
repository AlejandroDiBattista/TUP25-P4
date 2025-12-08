from typing import Optional
from sqlmodel import SQLModel


class Token(SQLModel):
    access_token: str
    token_type: str


class TokenData(SQLModel):
    email: Optional[str] = None


class UsuarioLogin(SQLModel):
    email: str
    password: str