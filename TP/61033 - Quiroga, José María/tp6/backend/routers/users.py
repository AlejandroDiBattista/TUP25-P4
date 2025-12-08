from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from sqlmodel import Session, select
from db import get_session
from core_models import User
from auth import get_password_hash, verify_password, create_access_token, revoke_token, oauth2_scheme, get_current_user
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(tags=["Usuarios"]) 


class RegisterSchema(BaseModel):
    nombre: str
    email: str
    password: str


@router.post("/registrar")
def registrar(data: RegisterSchema, session: Session = Depends(get_session)):
    # check existing email
    stmt = select(User).where(User.email == data.email)
    if session.exec(stmt).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(nombre=data.nombre, email=data.email, hashed_password=get_password_hash(data.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"id": user.id, "nombre": user.nombre, "email": user.email}


@router.post("/iniciar-sesion")
async def login(request: Request, session: Session = Depends(get_session)):
    """
    Login endpoint accepting either OAuth2 form data (application/x-www-form-urlencoded)
    or JSON body {"email":..., "password":...} for convenience (used by REST clients).
    """
    # Try JSON first if content-type is application/json
    content_type = request.headers.get("content-type", "")
    if content_type.startswith("application/json"):
        body = await request.json()
        username = body.get("email") or body.get("username")
        password = body.get("password")
    else:
        # fallback to form data (OAuth2PasswordRequestForm compatible)
        form = await request.form()
        username = form.get("username") or form.get("email")
        password = form.get("password")

    if not username or not password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing credentials")

    stmt = select(User).where(User.email == username)
    user = session.exec(stmt).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect credentials")
    token = create_access_token({"sub": str(user.id)})
    # Return token plus basic user info to simplify frontend flows
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "nombre": user.nombre, "email": user.email}
    }


@router.post("/cerrar-sesion")
def logout(token: str = Depends(oauth2_scheme)):
    """Cerrar sesión: revoca el token JWT recibido en el header Authorization: Bearer <token>"""
    revoke_token(token)
    return {"ok": True}


@router.get("/me")
def me(user=Depends(get_current_user)):
    """Devuelve información del usuario actual autenticado."""
    return {"id": user.id, "nombre": user.nombre, "email": user.email}

