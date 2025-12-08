from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select, SQLModel
from backend.database import engine
from backend.models.user import User

router = APIRouter(prefix="/auth")

def get_session():
    with Session(engine) as session:
        yield session


# ----- SCHEMAS -----
class UserCreate(SQLModel):
    nombre: str
    email: str
    contraseña: str


class LoginData(SQLModel):
    email: str
    contraseña: str


# ----- REGISTRO -----
@router.post("/registrar")
def registrar_usuario(datos: UserCreate, session: Session = Depends(get_session)):

    existente = session.exec(
        select(User).where(User.email == datos.email)
    ).first()

    if existente:
        raise HTTPException(400, "El email ya está registrado")

    nuevo = User(
        nombre=datos.nombre,
        email=datos.email,
        contraseña=datos.contraseña  # texto plano OK para este trabajo
    )

    session.add(nuevo)
    session.commit()
    session.refresh(nuevo)

    return {"mensaje": "Usuario registrado", "usuario": nuevo}


# ----- LOGIN -----
@router.post("/login")
def login(data: LoginData, session: Session = Depends(get_session)):

    usuario = session.exec(
        select(User).where(
            User.email == data.email,
            User.contraseña == data.contraseña
        )
    ).first()

    if not usuario:
        raise HTTPException(400, "Credenciales incorrectas")

    return {"mensaje": "Login exitoso", "usuario": usuario}
