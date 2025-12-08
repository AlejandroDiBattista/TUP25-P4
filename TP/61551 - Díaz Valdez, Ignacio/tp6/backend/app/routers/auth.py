"""Router de autenticación (FASE 2).

Endpoints:
 - POST /registrar: crear usuario con contraseña hasheada (email único)
 - POST /iniciar-sesion: validar credenciales y devolver JWT
 - POST /cerrar-sesion: punto para logout (dummy)
"""

from fastapi import APIRouter, HTTPException, Body, Depends
from sqlmodel import select
from ..database import get_session
from models import Usuario
from ..deps import (
    UsuarioCreate,
    UsuarioLogin,
    get_password_hash,
    authenticate_user,
    create_access_token,
    Token,
    get_current_user,
)

router = APIRouter(prefix="", tags=["auth"])  # root-level endpoints

@router.post("/registrar", status_code=201, summary="Registrar usuario")
def registrar_usuario(payload: UsuarioCreate = Body(...)):
    """Registrar un nuevo usuario con email único y password hasheado."""
    with get_session() as session:
        existing = session.exec(select(Usuario).where(Usuario.email == payload.email)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email ya registrado")
        nuevo = Usuario(
            email=payload.email,
            nombre=payload.nombre or "",
            password_hash=get_password_hash(payload.password),
        )
        session.add(nuevo)
        session.commit()
        session.refresh(nuevo)
        return {"id": nuevo.id, "email": nuevo.email, "nombre": nuevo.nombre}

@router.post("/iniciar-sesion", response_model=Token, summary="Iniciar sesión")
def iniciar_sesion(datos: UsuarioLogin = Body(...)):
    """Autenticar usuario y devolver token JWT."""
    usuario = authenticate_user(datos.email, datos.password)
    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    token = create_access_token(subject=str(usuario.id))
    return {"access_token": token, "token_type": "bearer"}

@router.post("/cerrar-sesion", summary="Cerrar sesión")
def cerrar_sesion():
    """Cerrar sesión (dummy); el cliente debe descartar el token JWT."""
    return {"message": "Sesión cerrada. El token debe eliminarse en el cliente."}

@router.get("/me", summary="Perfil del usuario autenticado")
def perfil(current = Depends(get_current_user)):
    """Devolver datos básicos del usuario autenticado."""
    return {"id": current.id, "email": current.email, "nombre": current.nombre}
