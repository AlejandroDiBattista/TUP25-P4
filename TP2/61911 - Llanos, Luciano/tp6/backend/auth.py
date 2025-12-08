"""
Sistema de autenticación con JWT y bcrypt
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
from models.usuarios import Usuario
from database import get_session

# Configuración de seguridad
SECRET_KEY = "tu-clave-secreta-super-segura-cambiala-en-produccion"  # En producción usar variable de entorno
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 30 minutos como especifica el enunciado

# Configurar bcrypt con configuración específica
pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto",
    bcrypt__rounds=12
)

# Configurar Bearer token
security = HTTPBearer()

def verificar_password(password_plano: str, password_hash: str) -> bool:
    """Verificar si la contraseña coincide con el hash"""
    return pwd_context.verify(password_plano, password_hash)

def get_password_hash(password: str) -> str:
    """Generar hash de la contraseña"""
    return pwd_context.hash(password)

def crear_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crear un token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verificar_token(token: str) -> Optional[str]:
    """Verificar y decodificar el token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return email
    except JWTError:
        return None

def autenticar_usuario(email: str, password: str, session: Session) -> Optional[Usuario]:
    """Autenticar usuario con email y contraseña"""
    usuario = session.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        return None
    if not verificar_password(password, usuario.password_hash):
        return None
    return usuario

def get_usuario_actual(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> Usuario:
    """Dependency para obtener el usuario actual desde el token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    email = verificar_token(token)
    if email is None:
        raise credentials_exception
    
    usuario = session.query(Usuario).filter(Usuario.email == email).first()
    if usuario is None:
        raise credentials_exception
    
    return usuario

def get_usuario_activo_actual(usuario_actual: Usuario = Depends(get_usuario_actual)) -> Usuario:
    """Dependency para obtener el usuario actual activo"""
    if not usuario_actual.activo:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    return usuario_actual