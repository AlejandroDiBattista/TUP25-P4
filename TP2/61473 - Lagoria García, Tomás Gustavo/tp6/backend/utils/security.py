"""
Utilidades para seguridad y autenticación.

Basado en las prácticas de clase (24.login/login.py)
Incluye funciones para hashing de contraseñas y gestión de tokens.
"""
from hashlib import sha256
from secrets import token_hex
from datetime import datetime, timedelta


# ==================== CONTRASEÑAS ====================

def crear_hash_password(password: str) -> str:
    """
    Crea un hash SHA-256 de la contraseña.
    
    Args:
        password: Contraseña en texto plano
        
    Returns:
        Hash hexadecimal de 64 caracteres
        
    Ejemplo:
        >>> crear_hash_password("miPassword123")
        'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'
    """
    return sha256(password.encode('utf-8')).hexdigest()


def validar_password(password: str, password_hash: str) -> bool:
    """
    Valida si la contraseña coincide con el hash.
    
    Args:
        password: Contraseña en texto plano a verificar
        password_hash: Hash almacenado en la base de datos
        
    Returns:
        True si la contraseña es correcta, False en caso contrario
        
    Ejemplo:
        >>> hash_guardado = crear_hash_password("miPassword123")
        >>> validar_password("miPassword123", hash_guardado)
        True
        >>> validar_password("otraPassword", hash_guardado)
        False
    """
    return crear_hash_password(password) == password_hash


# Alias para mantener consistencia con el código existente
verificar_password = validar_password


# ==================== TOKENS ====================

def generar_token() -> str:
    """
    Genera un token aleatorio seguro para autenticación.
    
    Returns:
        Token hexadecimal de 64 caracteres (256 bits de entropía)
        
    Ejemplo:
        >>> generar_token()
        'a3f5c8e9b2d4a1f6c7e8b9d0a1f2c3e4...'
    """
    return token_hex(32)  # 32 bytes = 64 caracteres hex


def generar_expiracion_token(horas: int = 24) -> datetime:
    """
    Genera fecha de expiración del token.
    
    Args:
        horas: Cantidad de horas de validez del token (default: 24)
        
    Returns:
        Fecha y hora de expiración
        
    Ejemplo:
        >>> expiracion = generar_expiracion_token(24)
        >>> expiracion > datetime.utcnow()
        True
    """
    return datetime.utcnow() + timedelta(hours=horas)


def token_vigente(expiracion: datetime) -> bool:
    """
    Verifica si un token aún es válido según su fecha de expiración.
    
    Args:
        expiracion: Fecha de expiración del token
        
    Returns:
        True si el token aún es válido, False si expiró
        
    Ejemplo:
        >>> exp_futuro = datetime.utcnow() + timedelta(hours=1)
        >>> token_vigente(exp_futuro)
        True
        >>> exp_pasado = datetime.utcnow() - timedelta(hours=1)
        >>> token_vigente(exp_pasado)
        False
    """
    return expiracion > datetime.utcnow()


# ==================== TARJETAS ====================

def enmascarar_tarjeta(numero_tarjeta: str) -> str:
    """
    Enmascara un número de tarjeta mostrando solo los últimos 4 dígitos.
    
    Args:
        numero_tarjeta: Número completo de la tarjeta
        
    Returns:
        Tarjeta enmascarada (ej: "**** **** **** 1234")
        
    Ejemplo:
        >>> enmascarar_tarjeta("1234567890123456")
        '**** **** **** 3456'
        >>> enmascarar_tarjeta("4532-1234-5678-9010")
        '**** **** **** 9010'
    """
    # Remover espacios y guiones
    numero_limpio = numero_tarjeta.replace(" ", "").replace("-", "")
    
    # Obtener últimos 4 dígitos
    ultimos_4 = numero_limpio[-4:]
    
    # Formatear con asteriscos
    return f"**** **** **** {ultimos_4}"
