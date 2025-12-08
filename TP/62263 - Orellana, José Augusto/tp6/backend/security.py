import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

from sqlmodel import Session, select
from models.usuarios import Usuario

def verificar_contrasenia(contrasenia_plana: str, contrasenia_hasheada: str) -> bool:
    """Verificar una contraseña hasheada (con salt)."""
    try:
        salt_hex, hash_almacenado_hex = contrasenia_hasheada.split(':')
        salt = bytes.fromhex(salt_hex)
    except (ValueError, TypeError):
        # Si el hash no tiene el formato 'salt:hash', falla seguro
        return False

    # Hasheamos la contraseña plana con el MISMO salt
    hash_nuevo = hashlib.pbkdf2_hmac(
        'sha256',
        contrasenia_plana.encode('utf-8'),
        salt,
        100000 # Iteraciones
    )

    # Comparamos los hashes de forma segura
    return hash_nuevo.hex() == hash_almacenado_hex

def obtener_hash_contrasenia(contrasenia: str) -> str:
    """Genera un hash con un 'salt' aleatorio."""
    salt = os.urandom(16) 

    # Creamos el hash
    hash_calculado = hashlib.pbkdf2_hmac(
        'sha256',
        contrasenia.encode('utf-8'), # Convertimos a bytes
        salt,
        100000 # Iteraciones
    )
    return f"{salt.hex()}:{hash_calculado.hex()}"

MINUTOS_EXPIRACION_TOKEN = 60

def crear_token_sesion() -> tuple[str, str]:
    """Crea un token aleatorio y su fecha de expiración."""
    token = secrets.token_hex(32)

    expiracion = (datetime.now(timezone.utc) + 
                  timedelta(minutes=MINUTOS_EXPIRACION_TOKEN)).isoformat()
    return token, expiracion

def obtener_usuario_desde_token(token: str, session: Session) -> Usuario | None:
    """Obtiene el usuario asociado a un token válido."""
    # Se crea la consulta para buscar el usuario por token
    statement = select(Usuario).where(Usuario.token == token)

    usuario = session.exec(statement).first()

    # Verificar si el usuario existe y si el token no ha expirado
    if usuario and usuario.token_expiration:
        # Se convierte el string de la bd a datetime
        expiracion = datetime.fromisoformat(usuario.token_expiration)

        # Se compara con la fecha actual
        if expiracion > datetime.now(timezone.utc):
            return usuario

    return None