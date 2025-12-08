"""Dependencias de autenticación y utilidades de seguridad (FASE 2).

Incluye:
 - Hash y verificación de password (Passlib / bcrypt)
 - Creación y validación de JWT (python-jose)
 - Modelos pydantic para creación y login de usuario
 - Dependencia get_current_user para proteger endpoints
"""

import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import jwt, JWTError
from pydantic import BaseModel, EmailStr
from sqlmodel import select
from .database import get_session
from models import Usuario

SECRET_KEY = os.environ.get("SECRET_KEY", "change-me-please")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# Nota: bcrypt está dando errores en este entorno (Python 3.14 / módulo sin __about__).
# Se reemplaza temporalmente por pbkdf2_sha256 para evitar el 500 en /registrar.
# En producción volver a bcrypt o usar passlib[bcrypt] cuando el wheel sea compatible.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/iniciar-sesion")

class UsuarioCreate(BaseModel):
    """Payload para registrar un nuevo usuario."""
    email: EmailStr
    nombre: Optional[str] = None
    password: str

class UsuarioLogin(BaseModel):
    """Payload para iniciar sesión (FASE 2)."""
    email: EmailStr
    password: str

class Token(BaseModel):
    """Respuesta estándar de autenticación."""
    access_token: str
    token_type: str = "bearer"

def get_password_hash(password: str) -> str:
    """Hashear contraseña usando bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar hash de contraseña."""
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(email: str, password: str) -> Optional[Usuario]:
    """Devolver usuario válido o None si credenciales incorrectas."""
    with get_session() as session:
        usuario = session.exec(select(Usuario).where(Usuario.email == email)).first()
        if not usuario or not verify_password(password, usuario.password_hash):
            return None
        return usuario

def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """Crear un JWT firmado con expiración configurable."""
    to_encode = {"sub": str(subject)}
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)) -> Usuario:
    """Obtener usuario autenticado desde el token Bearer.

    Lanza 401 si el token es inválido o el usuario no existe.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    with get_session() as session:
        usuario = session.get(Usuario, int(sub))
        if not usuario:
            raise credentials_exception
        return usuario
