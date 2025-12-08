from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_session
from models import Usuario
from schemas import UsuarioRegistro, UsuarioLogin, Token
from auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()

@router.post("/registrar", response_model=Token)
async def registrar_usuario(
    usuario_data: UsuarioRegistro,
    session: Session = Depends(get_session)
):
    """Registrar un nuevo usuario"""
    # Verificar si el email ya existe
    statement = select(Usuario).where(Usuario.email == usuario_data.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Crear nuevo usuario
    hashed_password = get_password_hash(usuario_data.contraseña)
    nuevo_usuario = Usuario(
        nombre=usuario_data.nombre,
        email=usuario_data.email,
        contraseña=hashed_password
    )
    session.add(nuevo_usuario)
    session.commit()
    session.refresh(nuevo_usuario)
    
    # Crear token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": nuevo_usuario.id},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/iniciar-sesion", response_model=Token)
async def iniciar_sesion(
    usuario_data: UsuarioLogin,
    session: Session = Depends(get_session)
):
    """Iniciar sesión y obtener token"""
    # Buscar usuario
    statement = select(Usuario).where(Usuario.email == usuario_data.email)
    usuario = session.exec(statement).first()
    
    if not usuario or not verify_password(usuario_data.contraseña, usuario.contraseña):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Crear token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": usuario.id},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/cerrar-sesion")
async def cerrar_sesion(
    current_user: Usuario = Depends(get_current_user)
):
    """Cerrar sesión (invalidar token)"""
    # En una implementación real, podrías agregar el token a una lista negra
    # Por ahora, simplemente retornamos éxito
    return {"message": "Sesión cerrada exitosamente"}

