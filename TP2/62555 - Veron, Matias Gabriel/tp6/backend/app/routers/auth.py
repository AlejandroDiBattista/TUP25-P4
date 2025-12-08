from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from pydantic import BaseModel
from app.database import get_session
from app.auth import hash_password, verify_password, create_token
from app.models.usuarios import Usuario

router = APIRouter()

# Modelo para registro
class RegisterRequest(BaseModel):
    nombre: str
    email: str
    password: str
    apellido: str = ""
    telefono: str = ""
    direccion: str = ""

# Modelo para respuesta de autenticación
class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: dict

@router.post("/register", response_model=AuthResponse)
def register(data: RegisterRequest, db: Session = Depends(get_session)):
    # Verificar si el email ya existe
    existing_user = db.exec(select(Usuario).where(Usuario.email == data.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email ya registrado"
        )
    
    # Crear nuevo usuario (solo con los campos que existen en el modelo)
    user = Usuario(
        nombre=data.nombre,
        email=data.email,
        password_hash=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Generar token
    token = create_token(data.email)
    
    return AuthResponse(
        access_token=token,
        usuario={
            "id": user.id,
            "nombre": user.nombre,
            "email": user.email,
        }
    )

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_session)):
    user = db.exec(select(Usuario).where(Usuario.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas"
        )
    
    token = create_token(form_data.username)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": {
            "id": user.id,
            "nombre": user.nombre,
            "email": user.email,
        }
    }

@router.post("/logout")
def logout():
    return {"ok": True}
