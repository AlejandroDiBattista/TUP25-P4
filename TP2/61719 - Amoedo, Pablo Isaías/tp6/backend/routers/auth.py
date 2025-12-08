from fastapi import APIRouter, HTTPException, Depends
from utils.security import obtener_usuario_actual
from sqlmodel import Session, select
from models.usuarios import Usuario
from db.database import engine
from utils.security import hash_password, verify_password, crear_token
from pydantic import BaseModel


router = APIRouter()

class RegistroRequest(BaseModel):
    nombre: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/registrar")
def registrar_usuario(data: RegistroRequest):
    """Registrar un nuevo usuario"""
    with Session(engine) as session:
        existe = session.exec(select(Usuario).where(Usuario.email == data.email)).first()
        if existe:
            raise HTTPException(status_code=400, detail="El email ya está registrado")
        usuario = Usuario(
            nombre=data.nombre,
            email=data.email,
            hashed_password=hash_password(data.password)
        )
        session.add(usuario)
        session.commit()
        return {"mensaje": "Usuario registrado correctamente"}


@router.post("/login")
def login(data: LoginRequest):
    """Iniciar sesión y obtener token"""
    with Session(engine) as session:
        usuario = session.exec(select(Usuario).where(Usuario.email == data.email)).first()
        if not usuario or not verify_password(data.password, usuario.hashed_password):
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
        token = crear_token({"sub": usuario.email})
        return {"access_token": token, "token_type": "bearer"}


@router.post("/cerrar-sesion")
def cerrar_sesion(email: str = Depends(obtener_usuario_actual)):
    """Cerrar sesión (invalidar token)"""
    # En una aplicación real, aquí se podría invalidar el token en una blacklist
    # Por ahora, simplemente retornamos un mensaje de éxito
    return {"mensaje": "Sesión cerrada correctamente"}


@router.get("/perfil")
def ver_perfil(email: str = Depends(obtener_usuario_actual)):
    """Obtener datos del perfil del usuario autenticado"""
    with Session(engine) as session:
        usuario = session.exec(select(Usuario).where(Usuario.email == email)).first()
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return {
            "nombre": usuario.nombre,
            "email": usuario.email
        }
    




