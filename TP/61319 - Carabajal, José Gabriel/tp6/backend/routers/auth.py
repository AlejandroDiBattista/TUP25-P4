from fastapi import APIRouter, HTTPException, Depends, status
from sqlmodel import Session, select
from typing import Annotated

from models.usuarios import Usuario
from schemas.auth import RegisterIn, LoginIn, UserOut, TokenOut
from security.auth import get_password_hash, verify_password, create_access_token
from db import get_session

router = APIRouter(prefix="", tags=["auth"])


@router.post("/registrar", response_model=UserOut)
def registrar(
    data: RegisterIn,
    session: Annotated[Session, Depends(get_session)],
):
    """
    Registra un usuario nuevo si el email no existe.
    """
    existe = session.exec(
        select(Usuario).where(Usuario.email == data.email)
    ).first()

    if existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado",
        )

    user = Usuario(
        nombre=data.nombre,
        email=data.email,
        password_hash=get_password_hash(data.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    return UserOut(id=user.id, nombre=user.nombre, email=user.email)


@router.post("/iniciar-sesion", response_model=TokenOut)
def iniciar_sesion(
    data: LoginIn,
    session: Annotated[Session, Depends(get_session)],
):
    """
    Verifica credenciales y retorna un access token + datos básicos del usuario.
    """
    user = session.exec(
        select(Usuario).where(Usuario.email == data.email)
    ).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    # Si usás create_access_token(data: dict), pasamos el 'sub' en el payload
    token = create_access_token({"sub": str(user.id)})

    return TokenOut(
        access_token=token,
        user=UserOut(id=user.id, nombre=user.nombre, email=user.email),
    )

@router.post("/cerrar-sesion", status_code=status.HTTP_204_NO_CONTENT)
def cerrar_sesion():
    """
    Cierre de sesión 'stateless':
    """
    return  # 204 sin cuerpo

