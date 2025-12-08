from collections.abc import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session

from app.core.security import decode_access_token
from app.db.session import get_session
from app.models.user import User
from app.schemas.auth import TokenPayload
from app.crud.user import get_user_by_email

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_db() -> Generator[Session, None, None]:
    """Expose a SQLModel session as a dependency."""
    yield from get_session()


def get_current_user(
    session: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    """Return current user from JWT token."""
    try:
        payload = decode_access_token(token)
        token_data = TokenPayload(**payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    if token_data.sub is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user_by_email(session, token_data.sub)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Ensure the current user is active."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo.",
        )
    return current_user

