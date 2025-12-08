from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import timedelta

from database import get_session
from models import Usuario
from schemas import UsuarioRegistro, UsuarioLogin, TokenResponse, UsuarioResponse
from utils import hash_password, verify_password, create_access_token, decode_token

router = APIRouter(prefix="/api", tags=["autenticación"])

# Diccionario para almacenar tokens inválidos (cerrar sesión)
invalidated_tokens = set()


@router.post("/registrar", response_model=TokenResponse)
def registrar(usuario_data: UsuarioRegistro, session: Session = Depends(get_session)):
    """Registrar un nuevo usuario con validaciones completas"""
    
    try:
        # Validar que el email no esté registrado
        statement = select(Usuario).where(Usuario.email == usuario_data.email)
        usuario_existente = session.exec(statement).first()
        
        if usuario_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )
        
        # Validar nombre no vacío
        if not usuario_data.nombre or not usuario_data.nombre.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="El nombre no puede estar vacío"
            )
        
        # Validar contraseña (mínimo 6 caracteres)
        if len(usuario_data.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="La contraseña debe tener al menos 6 caracteres"
            )
        
        # Crear nuevo usuario
        nuevo_usuario = Usuario(
            nombre=usuario_data.nombre.strip(),
            email=usuario_data.email.lower(),
            password_hash=hash_password(usuario_data.password)
        )
        
        session.add(nuevo_usuario)
        session.commit()
        session.refresh(nuevo_usuario)
        
        # Crear token
        access_token = create_access_token(data={"sub": str(nuevo_usuario.id)})
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            usuario=UsuarioResponse(
                id=nuevo_usuario.id,
                nombre=nuevo_usuario.nombre,
                email=nuevo_usuario.email
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al registrar usuario. Por favor intenta más tarde"
        )


@router.post("/iniciar-sesion", response_model=TokenResponse)
def iniciar_sesion(credenciales: UsuarioLogin, session: Session = Depends(get_session)):
    """Iniciar sesión y obtener token con validaciones"""
    
    try:
        # Buscar usuario por email
        statement = select(Usuario).where(Usuario.email == credenciales.email.lower())
        usuario = session.exec(statement).first()
        
        if not usuario or not verify_password(credenciales.password, usuario.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos"
            )
        
        # Crear token
        access_token = create_access_token(data={"sub": str(usuario.id)})
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            usuario=UsuarioResponse(
                id=usuario.id,
                nombre=usuario.nombre,
                email=usuario.email
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al iniciar sesión. Por favor intenta más tarde"
        )


@router.post("/cerrar-sesion")
def cerrar_sesion(token: str = None):
    """Cerrar sesión invalidando el token"""
    
    if token:
        invalidated_tokens.add(token)
    
    return {"mensaje": "Sesión cerrada correctamente"}
