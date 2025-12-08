import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import jwt, JWTError
from pydantic import BaseModel, EmailStr
from sqlmodel import select

from db import get_session  # compat wrapper hacia app.database
from models import Usuario  # origen de verdad: paquete models/


# Configuración de seguridad (usar variable de entorno en producción)
SECRET_KEY = os.environ.get("SECRET_KEY", "change-me-please-put-a-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# Nota: en algunos entornos Windows/Python recientes, ciertas versiones de
# `bcrypt` fallan al importar causando 500 en /registrar. Para evitarlo,
# usamos pbkdf2_sha256 aquí también (en línea con app/deps.py).
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/iniciar-sesion")


class UsuarioCreate(BaseModel):
    email: EmailStr
    nombre: Optional[str] = None
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def authenticate_user(email: str, password: str) -> Optional[Usuario]:
    with get_session() as session:
        usuario = session.exec(select(Usuario).where(Usuario.email == email)).first()
        if not usuario:
            return None
        if not verify_password(password, usuario.password_hash):
            return None
        return usuario


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = {"sub": str(subject)}
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)) -> Usuario:
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
