from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session

from app.core.security import JWTError
from app.db.session import get_engine
from app.models import Usuario
from app.services.auth import validate_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/iniciar-sesion")


def get_session() -> Generator[Session, None, None]:
    engine = get_engine()
    with Session(engine) as session:
        yield session


def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)) -> Usuario:
    try:
        user_id = validate_token(token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    usuario = session.get(Usuario, user_id)
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")

    return usuario
