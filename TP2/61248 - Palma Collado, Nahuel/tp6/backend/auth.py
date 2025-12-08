from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select

from database import get_session
from models import TokenRevocado, Usuario
from settings import SECRET_KEY, access_token_expires_delta

ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/iniciar-sesion")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TokenDecodificado:
    def __init__(self, sub: int, jti: str, exp: datetime) -> None:
        self.sub = sub
        self.jti = jti
        self.exp = exp


def verificar_password(password_plano: str, password_hash: str) -> bool:
    return pwd_context.verify(password_plano, password_hash)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def crear_access_token(usuario_id: int) -> tuple[str, datetime, str]:
    expira = datetime.now(tz=timezone.utc) + access_token_expires_delta()
    jti = uuid.uuid4().hex
    payload = {"sub": str(usuario_id), "exp": expira, "jti": jti}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token, expira, jti


def decodificar_token(token: str) -> TokenDecodificado:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        jti = payload.get("jti")
        exp = payload.get("exp")
        if sub is None or jti is None or exp is None:
            raise JWTError("Token inválido")
        exp_datetime = datetime.fromtimestamp(exp, tz=timezone.utc)
        return TokenDecodificado(sub=int(sub), jti=str(jti), exp=exp_datetime)
    except JWTError as exc:  # pragma: no cover - jose ya valida estructura
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def guardar_token_revocado(*, token: TokenDecodificado, session: Session) -> None:
    revocado = TokenRevocado(jti=token.jti, usuario_id=token.sub, expira_en=token.exp)
    session.add(revocado)
    session.commit()


def token_revocado(jti: str, session: Session) -> bool:
    consulta = select(TokenRevocado).where(TokenRevocado.jti == jti)
    return session.exec(consulta).first() is not None


def obtener_usuario_actual(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Annotated[Session, Depends(get_session)],
) -> Usuario:
    credenciales_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )

    datos_token = decodificar_token(token)
    if datos_token.exp < datetime.now(timezone.utc):
        raise credenciales_invalidas

    if token_revocado(datos_token.jti, session):
        raise credenciales_invalidas

    usuario = session.get(Usuario, datos_token.sub)
    if usuario is None:
        raise credenciales_invalidas

    return usuario


def autenticar_usuario(*, email: str, password: str, session: Session) -> Usuario | None:
    consulta = select(Usuario).where(Usuario.email == email)
    usuario = session.exec(consulta).first()
    if usuario is None:
        return None
    if not verificar_password(password, usuario.password_hash):
        return None
    return usuario