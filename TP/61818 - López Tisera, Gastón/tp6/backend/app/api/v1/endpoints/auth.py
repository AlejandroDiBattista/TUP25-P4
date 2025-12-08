from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.api.deps import get_current_active_user, get_db
from app.core.config import get_settings
from app.core.security import create_access_token
from app.crud.user import authenticate_user, create_user, get_user_by_email
from app.models.user import User
from app.schemas import LoginRequest, Token, UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, session: Session = Depends(get_db)) -> UserRead:
    """Registrar un nuevo usuario."""
    existing_user = get_user_by_email(session, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado.",
        )

    user = create_user(session, user_in)
    return UserRead.model_validate(user)


@router.post("/login", response_model=Token)
def login(
    credentials: LoginRequest,
    session: Session = Depends(get_db),
) -> Token:
    """Iniciar sesión y devolver un token de acceso."""
    user = authenticate_user(session, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas.",
        )

    settings = get_settings()
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(user.email, expires_delta=access_token_expires)
    return Token(access_token=access_token)


@router.post("/logout")
def logout() -> dict[str, str]:
    """Cerrar sesión (el frontend debe descartar el token)."""
    return {"message": "Sesión cerrada. El token debe eliminarse del lado del cliente."}


@router.get("/me", response_model=UserRead)
def read_me(current_user: User = Depends(get_current_active_user)) -> UserRead:
    """Obtener datos del usuario autenticado."""
    return UserRead.model_validate(current_user)

