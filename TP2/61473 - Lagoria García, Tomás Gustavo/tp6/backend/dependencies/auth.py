"""
Dependencias de autenticación para proteger endpoints
"""
from fastapi import Depends, HTTPException, Header
from sqlmodel import Session, select
from typing import Annotated, Optional
from datetime import datetime

from database import get_session
from models import Usuario


def get_usuario_actual(
    authorization: Annotated[str | None, Header()] = None,
    session: Session = Depends(get_session)
) -> Usuario:
    """
    Obtiene el usuario autenticado actual desde el header Authorization.
    
    Formato esperado: Authorization: Bearer <token>
    
    Raises:
        HTTPException 401: Si no hay token o es inválido
        HTTPException 401: Si el token expiró
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="No autenticado - Token requerido"
        )
    
    # Extraer el token del header "Bearer <token>"
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Formato de token inválido. Use: Bearer <token>"
        )
    
    token = parts[1]
    
    # Buscar usuario por token
    statement = select(Usuario).where(Usuario.token == token)
    usuario = session.exec(statement).first()
    
    if not usuario:
        raise HTTPException(
            status_code=401,
            detail="Token inválido"
        )
    
    # Verificar que el token no haya expirado
    if usuario.token_expiration and usuario.token_expiration < datetime.now():
        raise HTTPException(
            status_code=401,
            detail="Token expirado"
        )
    
    return usuario


def get_usuario_opcional(
    authorization: Annotated[str | None, Header()] = None,
    session: Session = Depends(get_session)
) -> Optional[Usuario]:
    """
    Obtiene el usuario autenticado si existe, None si no.
    Útil para endpoints que funcionan con o sin autenticación.
    """
    if not authorization:
        return None
    
    try:
        return get_usuario_actual(authorization, session)
    except HTTPException:
        return None
