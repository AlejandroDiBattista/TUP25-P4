from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """Return the hashed representation of a password."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    subject: str | int | Any,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a signed JWT access token."""
    settings = get_settings()
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.access_token_expire_minutes)

    expire = datetime.now(timezone.utc) + expires_delta
    payload = {"sub": str(subject), "exp": expire}
    return jwt.encode(
        payload,
        settings.secret_key.get_secret_value(),
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode a JWT token and return its payload."""
    settings = get_settings()
    try:
        return jwt.decode(
            token,
            settings.secret_key.get_secret_value(),
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError as exc:
        raise ValueError("Token inválido o expirado") from exc

