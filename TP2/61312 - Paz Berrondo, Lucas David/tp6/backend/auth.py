"""
Módulo de autenticación con JWT y hashing de contraseñas.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt
from jose import JWTError, jwt

# Configuración de seguridad
SECRET_KEY = "tu_clave_secreta_super_segura_cambiar_en_produccion_2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# ==================== FUNCIONES DE HASH ====================

def verificar_contraseña(contraseña_plana: str, contraseña_hash: str) -> bool:
    """
    Verificar si una contraseña en texto plano coincide con su hash.
    
    Args:
        contraseña_plana: Contraseña en texto plano
        contraseña_hash: Contraseña hasheada almacenada en BD
        
    Returns:
        True si coinciden, False en caso contrario
    """
    contraseña_bytes = contraseña_plana.encode('utf-8')
    hash_bytes = contraseña_hash.encode('utf-8')
    return bcrypt.checkpw(contraseña_bytes, hash_bytes)


def obtener_hash_contraseña(contraseña: str) -> str:
    """
    Generar hash de una contraseña usando bcrypt.
    
    Args:
        contraseña: Contraseña en texto plano
        
    Returns:
        Hash de la contraseña
    """
    contraseña_bytes = contraseña.encode('utf-8')
    salt = bcrypt.gensalt()
    hash_bytes = bcrypt.hashpw(contraseña_bytes, salt)
    return hash_bytes.decode('utf-8')


# ==================== FUNCIONES DE JWT ====================

def crear_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Crear un token JWT de acceso.
    
    Args:
        data: Datos a incluir en el token (usualmente {"sub": email})
        expires_delta: Tiempo de expiración (default: 30 minutos)
        
    Returns:
        Token JWT codificado
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verificar_token(token: str) -> Optional[str]:
    """
    Verificar y decodificar un token JWT.
    
    Args:
        token: Token JWT a verificar
        
    Returns:
        Email del usuario si el token es válido, None en caso contrario
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return email
    except JWTError:
        return None
