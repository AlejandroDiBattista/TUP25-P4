from fastapi import APIRouter, HTTPException, Depends, Header, status, Request
from sqlmodel import select
from typing import Optional
from models import Usuario
from db import get_session
from schemas import RegisterSchema, LoginSchema
import auth as _auth

router = APIRouter()

def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No autorizado")
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Token inválido")
    token = parts[1]
    if _auth.is_token_blacklisted(token):
        raise HTTPException(status_code=401, detail="Token invalidado")
    payload = _auth.decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    return payload

@router.post("/registrar", status_code=201)
def registrar(data: RegisterSchema):
    session = get_session()
    existing = session.exec(select(Usuario).where(Usuario.email == data.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    user = Usuario(nombre=data.nombre, email=data.email, hashed_password=_auth.hash_password(data.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"id": user.id, "email": user.email}

@router.post("/iniciar-sesion")
def iniciar_sesion(data: LoginSchema):
    session = get_session()
    user = session.exec(select(Usuario).where(Usuario.email == data.email)).first()
    if not user or not _auth.verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = _auth.create_access_token({"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/cerrar-sesion")
def cerrar_sesion(request: Request, authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No autorizado")
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Token inválido")
    token = parts[1]
    _auth.blacklist_token(token)
    return {"detail": "Sesión cerrada"}
