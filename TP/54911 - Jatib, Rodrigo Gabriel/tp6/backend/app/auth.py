from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from . import models, db
from .config import settings
from uuid import uuid4

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

_token_blacklist: set[str] = set()


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    jti = str(uuid4())
    to_encode.update({"exp": expire, "jti": jti})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def invalidate_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        jti = payload.get("jti")
    except JWTError:
        jti = None

    try:
        with Session(db.engine) as session:
            rt = models.RevokedToken(token=(None if jti else token), jti=jti)
            session.add(rt)
            session.commit()
    except Exception:
        _token_blacklist.add(token)


def is_token_invalidated(token: str) -> bool:
    if token in _token_blacklist:
        return True

    try:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            jti = payload.get("jti")
        except JWTError:
            jti = None

        with Session(db.engine) as session:
            if jti:
                statement = select(models.RevokedToken).where(models.RevokedToken.jti == jti)
            else:
                statement = select(models.RevokedToken).where(models.RevokedToken.token == token)
            found = session.exec(statement).first()
            return found is not None
    except Exception:
        return token in _token_blacklist


def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")

    if is_token_invalidated(token):
        raise HTTPException(status_code=401, detail="Token has been invalidated")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    with Session(db.engine) as session:
        statement = select(models.User).where(models.User.email == email)
        result = session.exec(statement).first()
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        return result
