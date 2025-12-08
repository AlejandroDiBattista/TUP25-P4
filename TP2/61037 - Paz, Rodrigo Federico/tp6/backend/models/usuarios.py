from sqlmodel import SQLModel, Field
from typing import Optional
from pydantic import validator
import re

class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: str
    password: str
    
    @validator('email')
    def validar_email(cls, v):
        # Validar formato de email básico
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, v):
            raise ValueError('Formato de email inválido')
        return v.lower().strip()
    
    @validator('nombre')
    def validar_nombre(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError('El nombre debe tener al menos 2 caracteres')
        if len(v) > 100:
            raise ValueError('El nombre no puede exceder 100 caracteres')
        return v
    
    @validator('password')
    def validar_password(cls, v):
        if len(v) < 6:
            raise ValueError('La contraseña debe tener al menos 6 caracteres')
        return v