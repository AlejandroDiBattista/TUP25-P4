from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

from jose import jwt, JWTError
from passlib.context import CryptContext

SECRET_KEY = "9422ba285ccf960074dcf2da1b02d1592f7f53e5079d5e739a2f1960243d4b14"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 12  # 12 horas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)

def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Crea un JWT con el payload `data` (ej: {"sub": "user_id"})
    y fecha de expiración.
    """
    to_encode = data.copy()
    expire = datetime.now(tz=timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
