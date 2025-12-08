"""
Router de autenticación para registro, login y logout de usuarios
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Annotated
from datetime import datetime, timedelta

from database import get_session
from models import Usuario, UsuarioCreate, UsuarioLogin, UsuarioResponse, TokenResponse
from utils.security import crear_hash_password, verificar_password, generar_token
from dependencies.auth import get_usuario_actual

router = APIRouter(tags=["Autenticación"])

# Duración del token: 2 horas
TOKEN_EXPIRATION_HOURS = 2


@router.post("/registrar", response_model=UsuarioResponse, status_code=201)
def registrar_usuario(
    usuario_data: UsuarioCreate,
    session: Annotated[Session, Depends(get_session)]
):
    """
    Registra un nuevo usuario en el sistema
    
    - **nombre**: Nombre completo del usuario (mínimo 2 caracteres)
    - **email**: Email único del usuario
    - **password**: Contraseña (mínimo 6 caracteres, se guardará hasheada con SHA-256)
    """
    # Verificar si el email ya existe
    statement = select(Usuario).where(Usuario.email == usuario_data.email)
    usuario_existente = session.exec(statement).first()
    
    if usuario_existente:
        raise HTTPException(
            status_code=400,
            detail="El email ya está registrado"
        )
    
    # Crear nuevo usuario
    password_hash = crear_hash_password(usuario_data.password)
    
    nuevo_usuario = Usuario(
        nombre=usuario_data.nombre,
        email=usuario_data.email,
        password_hash=password_hash
    )
    
    session.add(nuevo_usuario)
    session.commit()
    session.refresh(nuevo_usuario)
    
    return nuevo_usuario


@router.post("/iniciar-sesion", response_model=TokenResponse)
def iniciar_sesion(
    credenciales: UsuarioLogin,
    session: Annotated[Session, Depends(get_session)]
):
    """
    Inicia sesión con email y contraseña
    
    - **email**: Email del usuario
    - **password**: Contraseña del usuario
    
    Retorna un token de acceso que debe enviarse en el header Authorization: Bearer <token>
    El token tiene una duración de 7 días
    """
    # Buscar usuario por email
    statement = select(Usuario).where(Usuario.email == credenciales.email)
    usuario = session.exec(statement).first()
    
    if not usuario:
        raise HTTPException(
            status_code=401,
            detail="Credenciales inválidas"
        )
    
    # Verificar contraseña
    if not verificar_password(credenciales.password, usuario.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Credenciales inválidas"
        )
    
    # Generar nuevo token
    token = generar_token()
    token_expiration = datetime.now() + timedelta(hours=TOKEN_EXPIRATION_HOURS)
    
    # Actualizar usuario con el nuevo token
    usuario.token = token
    usuario.token_expiration = token_expiration
    session.add(usuario)
    session.commit()
    session.refresh(usuario)
    
    return TokenResponse(
        access_token=token,
        usuario=UsuarioResponse.model_validate(usuario)
    )


@router.post("/cerrar-sesion", status_code=204)
def cerrar_sesion(
    usuario: Annotated[Usuario, Depends(get_usuario_actual)],
    session: Annotated[Session, Depends(get_session)]
):
    """
    Cierra la sesión del usuario actual
    
    Requiere: Header Authorization: Bearer <token>
    
    Invalida el token actual del usuario
    """
    # Invalidar el token del usuario
    usuario.token = None
    usuario.token_expiration = None
    session.add(usuario)
    session.commit()
    
    return None  # 204 No Content
