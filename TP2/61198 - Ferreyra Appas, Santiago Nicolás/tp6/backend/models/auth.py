
import hashlib
import secrets
from typing import Dict, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session, select

from .database import get_session
from .models import Cliente

security = HTTPBearer(auto_error=False)

# tokens en memoria: token -> id_cliente
_tokens_activos: Dict[str, int] = {}


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verificar_password(password: str, hash_guardado: str) -> bool:
    return hash_password(password) == hash_guardado


def generar_token(id_cliente: int) -> str:
    token = secrets.token_hex(32)
    _tokens_activos[token] = id_cliente
    return token


def invalidar_token(token: str) -> None:
    _tokens_activos.pop(token, None)


def obtener_id_cliente_desde_token(token: str) -> Optional[int]:
    return _tokens_activos.get(token)


def get_cliente_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session),
) -> Cliente:
    if credenciales is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
        )
    token = credenciales.credentials
    cliente_id = obtener_id_cliente_desde_token(token)
    if cliente_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o caducado",
        )

    cliente = session.get(Cliente, cliente_id)
    if not cliente or not cliente.activo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no válido",
        )
    return cliente
