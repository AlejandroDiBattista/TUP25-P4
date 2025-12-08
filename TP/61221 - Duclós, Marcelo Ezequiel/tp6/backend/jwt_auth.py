"""Sistema de autenticación JWT para la aplicación"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlmodel import Session

from database import get_session
from auth import obtener_usuario_por_id
from models import Usuario, UsuarioLogin

# Configuración JWT
SECRET_KEY = "tp6-shop-secret-key-2025"  # En producción debe ser una variable de entorno
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 horas

# Esquema de autenticación Bearer
security = HTTPBearer()

# Lista de tokens invalidados (en producción usar Redis o base de datos)
tokens_invalidados = set()

def crear_token_acceso(data: dict, expires_delta: Optional[timedelta] = None):
    """Crear token JWT de acceso"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verificar_token(token: str) -> Optional[dict]:
    """Verificar y decodificar token JWT"""
    try:
        # Verificar si el token está en la lista de invalidados
        if token in tokens_invalidados:
            return None
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Verificar que es un token de acceso
        if payload.get("type") != "access":
            return None
        
        # Verificar que no ha expirado
        exp = payload.get("exp")
        if exp is None or datetime.utcnow().timestamp() > exp:
            return None
        
        return payload
    
    except JWTError:
        return None

def obtener_usuario_actual(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> Usuario:
    """Dependency para obtener el usuario actual desde el token JWT"""
    
    token = credentials.credentials
    payload = verificar_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    usuario_id = payload.get("sub")
    if usuario_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    usuario = obtener_usuario_por_id(session, int(usuario_id))
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return usuario

def invalidar_token(token: str):
    """Agregar token a la lista de tokens invalidados"""
    tokens_invalidados.add(token)

class TokenResponse:
    """Esquema de respuesta para tokens"""
    def __init__(self, access_token: str, token_type: str = "bearer", expires_in: int = ACCESS_TOKEN_EXPIRE_MINUTES * 60):
        self.access_token = access_token
        self.token_type = token_type
        self.expires_in = expires_in  # En segundos

def autenticar_y_crear_token(session: Session, credenciales: UsuarioLogin) -> TokenResponse:
    """Autenticar usuario y crear token de acceso"""
    from auth import autenticar_usuario
    
    usuario = autenticar_usuario(session, credenciales.email, credenciales.contraseña)
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Crear token de acceso
    token_data = {"sub": str(usuario.id), "email": usuario.email, "nombre": usuario.nombre}
    access_token = crear_token_acceso(token_data)
    
    return TokenResponse(access_token=access_token)