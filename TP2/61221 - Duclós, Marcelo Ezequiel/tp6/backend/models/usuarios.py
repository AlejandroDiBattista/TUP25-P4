from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
import bcrypt


class Usuario(SQLModel, table=True):
    """Modelo de Usuario para la base de datos."""
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    email: str = Field(unique=True, max_length=200)
    contraseña_hash: str = Field(max_length=255)
    fecha_registro: datetime = Field(default_factory=datetime.now)
    
    # Relaciones
    carritos: List["Carrito"] = Relationship(back_populates="usuario")
    compras: List["Compra"] = Relationship(back_populates="usuario")
    
    def verificar_contraseña(self, contraseña: str) -> bool:
        """Verificar si la contraseña proporcionada es correcta"""
        return bcrypt.checkpw(contraseña.encode('utf-8'), self.contraseña_hash.encode('utf-8'))
    
    @classmethod
    def hash_contraseña(cls, contraseña: str) -> str:
        """Hash de la contraseña para almacenar en BD"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(contraseña.encode('utf-8'), salt).decode('utf-8')


class UsuarioCreate(SQLModel):
    """Esquema para crear un usuario"""
    nombre: str = Field(min_length=2, max_length=100)
    email: str = Field(max_length=200)
    contraseña: str = Field(min_length=6, max_length=50)


class UsuarioLogin(SQLModel):
    """Esquema para login de usuario"""
    email: str
    contraseña: str


class UsuarioResponse(SQLModel):
    """Esquema para respuesta de usuario (sin contraseña)"""
    id: int
    nombre: str
    email: str
    fecha_registro: datetime