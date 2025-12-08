from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from models.database import engine
from models.usuarios import Usuario
import bcrypt


router = APIRouter()

@router.post("/registrar")
def registrar_usuario(usuario: Usuario):
    with Session(engine) as session:
       
        existente = session.exec(select(Usuario).where(Usuario.email == usuario.email)).first()
        if existente:
            raise HTTPException(status_code=400, detail="El correo ya está registrado")

        hashed = bcrypt.hashpw(usuario.password.encode("utf-8"), bcrypt.gensalt())
        usuario.password = hashed.decode("utf-8")

        session.add(usuario)
        session.commit()
        session.refresh(usuario)
        return {"mensaje": "Usuario registrado correctamente", "usuario": usuario.email}


@router.post("/iniciar-sesion")
def iniciar_sesion(email: str, password: str):
    with Session(engine) as session:
        usuario = session.exec(select(Usuario).where(Usuario.email == email)).first()

        if not usuario:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")

        if not bcrypt.checkpw(password.encode("utf-8"), usuario.password.encode("utf-8")):
            raise HTTPException(status_code=401, detail="Contraseña incorrecta")

        return {"mensaje": "Inicio de sesión exitoso", "usuario_id": usuario.id, "usuario": usuario.nombre}
    
@router.post("/cerrar-sesion")
def cerrar_sesion():
    return {"mensaje": "Sesión cerrada"}    