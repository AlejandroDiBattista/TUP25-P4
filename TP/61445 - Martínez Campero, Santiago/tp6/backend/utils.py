"""Funciones utilitarias para seguridad y validaciones."""

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from starlette.authentication import AuthCredentials
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

pwd_hasher = PasswordHasher()
security = HTTPBearer()


def hash_password(password: str) -> str:
    return pwd_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_hasher.verify(hashed_password, plain_password)
        return True
    except VerifyMismatchError:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": int(expire.timestamp())})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        raise JWTError(f"Token inválido o expirado: {str(e)}")


def get_current_user(credentials = Depends(security)):
    from database import get_session
    from models.usuarios import Usuario
    
    token = credentials.credentials
    
    try:
        payload = decode_token(token)
        usuario_id: int = payload.get("sub")
        if usuario_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No se pudo validar las credenciales"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo validar las credenciales"
        )
    
    from database import engine
    from sqlmodel import Session
    with Session(engine) as session:
        usuario = session.get(Usuario, usuario_id)
        if usuario is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado"
            )
        return usuario


def validate_token_from_header(authorization: Optional[str]) -> int:
    """
    Valida el token JWT del header Authorization y retorna el usuario_id.
    Lanza HTTPException con 401 si el token es inválido.
    """
    if not authorization:
        print("[DEBUG] No authorization header provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )
    
    try:
        parts = authorization.split(" ")
        if len(parts) != 2:
            print(f"[DEBUG] Authorization header has {len(parts)} parts, expected 2")
            raise ValueError("Invalid authorization header format")
        
        scheme, token = parts
        if scheme.lower() != "bearer":
            print(f"[DEBUG] Invalid scheme: {scheme}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido o expirado"
            )
        
        print(f"[DEBUG] Decoding token: {token[:20]}...")
        payload = decode_token(token)
        usuario_id = payload.get("sub")
        
        if usuario_id is None:
            print("[DEBUG] No 'sub' claim in token payload")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido o expirado"
            )
        
        try:
            usuario_id_int = int(usuario_id)
        except (TypeError, ValueError):
            print(f"[DEBUG] Unable to cast usuario_id to int: {usuario_id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido o expirado"
            )
        
        print(f"[DEBUG] Token validated successfully for usuario_id: {usuario_id_int}")
        return usuario_id_int
    
    except ValueError as e:
        print(f"[DEBUG] ValueError in validate_token_from_header: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )
    except JWTError as e:
        print(f"[DEBUG] JWTError in validate_token_from_header: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[DEBUG] Unexpected error in validate_token_from_header: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )

