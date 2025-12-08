"""
Módulo de autenticación para el sistema de e-commerce.
Maneja hash de contraseñas, creación y verificación de tokens JWT.
"""

from datetime import datetime, timedelta
from typing import Optional
import bcrypt
from jose import JWTError, jwt

# Configuración de seguridad
SECRET_KEY = "tu-clave-secreta-super-segura-cambiala-en-produccion-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 días


def hashear_contraseña(contraseña: str) -> str:
    """
    Hashea una contraseña usando bcrypt.
    
    Args:
        contraseña: Contraseña en texto plano
        
    Returns:
        Contraseña hasheada
    """
    # Convertir a bytes y hashear
    password_bytes = contraseña.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verificar_contraseña(contraseña_plana: str, contraseña_hasheada: str) -> bool:
    """
    Verifica si una contraseña coincide con su hash.
    
    Args:
        contraseña_plana: Contraseña en texto plano
        contraseña_hasheada: Hash de la contraseña almacenada
        
    Returns:
        True si coinciden, False en caso contrario
    """
    password_bytes = contraseña_plana.encode('utf-8')
    hashed_bytes = contraseña_hasheada.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def crear_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Crea un token JWT con los datos proporcionados.
    
    Args:
        data: Diccionario con los datos a incluir en el token
        expires_delta: Tiempo de expiración opcional
        
    Returns:
        Token JWT codificado
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt


def verificar_token(token: str) -> Optional[dict]:
    """
    Verifica y decodifica un token JWT.
    
    Args:
        token: Token JWT a verificar
        
    Returns:
        Datos decodificados del token o None si es inválido
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
