from typing import Optional
from sqlmodel import Field, SQLModel


class Usuario(SQLModel, table=True):
    """Modelo de Usuario para la base de datos."""
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    nombre: str = Field(index=True) 
    # index=True hace más rápidas las búsquedas por nombre
    
    email: str = Field(unique=True, index=True, max_length=255)
    # "unique=True" es clave: no permite dos usuarios con el mismo email.
    # "index=True" es vital para que buscar un email al hacer login sea instantáneo.
    
    hashed_password: str = Field()
    # Este campo guardará la contraseña de forma segura (hasheada).
