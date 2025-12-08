from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional, Dict

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "CAMBIO_POR_ENV"  # reemplazar por variable de entorno en producción
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

_blacklist = set()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: Dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Optional[Dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def blacklist_token(token: str):
    _blacklist.add(token)

def is_token_blacklisted(token: str) -> bool:
    return token in _blacklist
