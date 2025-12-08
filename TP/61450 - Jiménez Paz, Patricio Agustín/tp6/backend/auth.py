from datetime import datetime, timedelta
from hashlib import sha256
from secrets import token_hex
from fastapi import Depends, HTTPException, status, Cookie
from sqlmodel import Session, select
from models import Usuario
from database import get_session


def hash_password(password: str) -> str:
    return sha256(password.encode('utf-8')).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password


def generar_token() -> str:
    return token_hex(16)


def verificar_token_valido(token: str, session: Session) -> Usuario | None:
    if not token:
        return None
    
    usuario = session.exec(select(Usuario).where(Usuario.token == token)).first()
    if not usuario or not usuario.token_expiracion:
        return None
    
    expiracion = datetime.fromisoformat(usuario.token_expiracion)
    if expiracion <= datetime.now():
        return None
    
    return usuario


def obtener_usuario_actual(
    token: str = Cookie(default=None),
    session: Session = Depends(get_session)
) -> Usuario:
    usuario = verificar_token_valido(token, session)
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No hay sesión activa o el token ha expirado"
        )
    
    return usuario


def verificar_no_autenticado(
    token: str = Cookie(default=None),
    session: Session = Depends(get_session)
):
    usuario = verificar_token_valido(token, session)
    
    if usuario:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya hay una sesión activa. Cierra sesión primero."
        )
    
    return True
