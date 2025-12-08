from typing import Optional
from sqlmodel import Field, SQLModel

class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(default="", max_length=255)
    email: str = Field(index=True, default="", max_length=255)
    contraseña: str = Field(default="", max_length=255)

