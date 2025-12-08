from pydantic import BaseModel, Field
import re

def validar_email(v: str) -> str:
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    if not re.match(pattern, v):
        raise ValueError('Email inválido')
    return v

class UsuarioCreate(BaseModel):
    nombre: str = Field(..., min_length=2)
    email: str = Field(..., min_length=5, pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    password: str = Field(..., min_length=6)

class UsuarioLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    email: str