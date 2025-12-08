import os
import hashlib
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel import Session, select
from models import Usuario, TokenData
from database import get_session

# Configuración de seguridad
SECRET_KEY = os.getenv("SECRET_KEY", "tu_clave_secreta_muy_segura_aqui")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="iniciar-sesion")


def verify_password(plain_password, hashed_password):
    """Verifica que la contraseña coincida con el hash"""
    password_hash = hashlib.sha256(plain_password.encode()).hexdigest()
    return password_hash == hashed_password


def get_password_hash(password):
    """Hashea la contraseña usando SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()


def authenticate_user(db: Session, email: str, password: str):
    user = db.exec(select(Usuario).where(Usuario.email == email)).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_session),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    user = db.exec(select(Usuario).where(Usuario.email == token_data.email)).first()
    if user is None:
        raise credentials_exception
    return user