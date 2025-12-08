from fastapi import APIRouter, HTTPException, Depends, status, Header
from sqlmodel import Session, select
from typing import Optional
from datetime import timedelta

from models import Usuario, UsuarioCreate, UsuarioResponse, UsuarioLogin, AuthResponse
from database import engine
from utils import hash_password, verify_password, create_access_token, decode_token
from config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["autenticacion"])


def get_session():
    with Session(engine) as session:
        yield session


def get_current_user(authorization: Optional[str] = Header(None)) -> Usuario:
    if not authorization:
        raise HTTPException(status_code=401, detail="Autorización requerida")
    
    try:
        scheme, token = authorization.split(" ")
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Tipo de autorización inválido")
        
        payload = decode_token(token)
        usuario_id = payload.get("sub")
        if usuario_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except ValueError:
        raise HTTPException(status_code=401, detail="Token inválido")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    with Session(engine) as session:
        usuario = session.get(Usuario, usuario_id)
        if not usuario:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        # Necesito descargar el usuario antes de cerrar la sesión
        usuario_dict = {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "contraseña_hash": usuario.contraseña_hash,
            "fecha_creacion": usuario.fecha_creacion
        }
    
    # Recrear el objeto Usuario fuera de la sesión
    usuario_obj = Usuario(**usuario_dict)
    return usuario_obj


@router.post("/registrar", response_model=AuthResponse)
def registrar(usuario_data: UsuarioCreate, session: Session = Depends(get_session)):
    statement = select(Usuario).where(Usuario.email == usuario_data.email)
    usuario_existente = session.exec(statement).first()
    
    if usuario_existente:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    
    usuario = Usuario(
        nombre=usuario_data.nombre or usuario_data.email.split("@")[0],
        email=usuario_data.email,
        contraseña_hash=hash_password(usuario_data.password)
    )
    session.add(usuario)
    session.commit()
    session.refresh(usuario)
    
    access_token = create_access_token(
        data={"sub": str(usuario.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": UsuarioResponse.from_orm(usuario)
    }


@router.post("/iniciar-sesion")
def iniciar_sesion(credenciales: UsuarioLogin, session: Session = Depends(get_session)):
    statement = select(Usuario).where(Usuario.email == credenciales.email)
    usuario = session.exec(statement).first()
    
    if not usuario or not verify_password(credenciales.password, usuario.contraseña_hash):
        raise HTTPException(status_code=401, detail="Email o contraseña inválidos")
    
    access_token = create_access_token(
        data={"sub": str(usuario.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": UsuarioResponse.from_orm(usuario)
    }


@router.post("/cerrar-sesion")
def cerrar_sesion(current_user: Usuario = Depends(get_current_user)):
    return {"mensaje": "Sesión cerrada correctamente"}


@router.get("/me", response_model=UsuarioResponse)
def obtener_usuario_actual(current_user: Usuario = Depends(get_current_user)):
    return current_user
