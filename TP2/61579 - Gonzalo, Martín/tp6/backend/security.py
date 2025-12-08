import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

# --- 1. Configuración de Hashing de Contraseñas ---

# Usamos 'bcrypt', que es el estándar de la industria.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Toma una contraseña en texto plano y devuelve su hash."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compara una contraseña en texto plano con un hash."""
    return pwd_context.verify(plain_password, hashed_password)


# --- 2. Configuración de Tokens JWT (JSON Web Tokens) ---

SECRET_KEY = "tu-clave-secreta-debe-ser-muy-dificil-de-adivinar"

# El algoritmo que usaremos para firmar el token.
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Crea un nuevo token de acceso (JWT).
    'data' es la información que queremos guardar en el token
    (ej: {"sub": "usuario@email.com"})
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Por defecto, expira en 30 minutos
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    
    # "Firma" el token con nuestra clave secreta
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """
    Decodifica un token para extraer sus datos.
    Devuelve los datos (payload) si el token es válido,
    o None si no lo es.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
    
    