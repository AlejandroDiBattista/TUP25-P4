from typing import Optional, Set

from sqlmodel import Session, select

from app.core.security import (
    JWTError,
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.models import Usuario


class EmailAlreadyRegisteredError(Exception):
    pass


_REVOKED_TOKENS: Set[str] = set()


def register_user(session: Session, nombre: str, email: str, password: str) -> Usuario:
    existing = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if existing:
        raise EmailAlreadyRegisteredError("El email ya está registrado")

    hashed = hash_password(password)
    usuario = Usuario(nombre=nombre, email=email, hashed_password=hashed)
    session.add(usuario)
    session.commit()
    session.refresh(usuario)
    return usuario


def authenticate_user(session: Session, email: str, password: str) -> Optional[Usuario]:
    usuario = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if not usuario:
        return None
    if not verify_password(password, usuario.hashed_password):
        return None
    return usuario


def issue_token(usuario: Usuario) -> str:
    subject = str(usuario.id)
    return create_access_token(subject)


def validate_token(token: str) -> int:
    payload = decode_access_token(token)
    subject = payload.get("sub")
    if subject is None:
        raise JWTError("Token inválido: falta el sujeto")
    if token in _REVOKED_TOKENS:
        raise JWTError("Token revocado")
    return int(subject)


def revoke_token(token: str) -> None:
    _REVOKED_TOKENS.add(token)
