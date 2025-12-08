from fastapi import APIRouter, HTTPException, Depends, status
from sqlmodel import Session, select
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

from db import get_session
from models import Usuario
from schemas import UsuarioCreate, UsuarioLogin, Token

router = APIRouter()

# 🔒 Configuración JWT
SECRET_KEY = "cambia_esta_clave_por_algo_seguro"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# 🔑 Hasheo de contraseñas
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# 📥 Definir esquema de autenticación por token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/iniciar-sesion")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(data: dict, expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ✅ Registrar usuario
@router.post("/registrar", status_code=201)
def registrar(usuario: UsuarioCreate, session: Session = Depends(get_session)):
    existente = session.exec(select(Usuario).where(Usuario.email == usuario.email)).first()
    if existente:
        raise HTTPException(400, "El email ya está registrado")

    nuevo = Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        password=hash_password(usuario.password),
    )

    session.add(nuevo)
    session.commit()
    session.refresh(nuevo)
    return {"message": "Usuario registrado correctamente"}


# ✅ Login
@router.post("/iniciar-sesion", response_model=Token)
def login(data: UsuarioLogin, session: Session = Depends(get_session)):
    user = session.exec(select(Usuario).where(Usuario.email == data.email)).first()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(401, "Credenciales incorrectas")

    token = create_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "nombre": user.nombre, "email": user.email}
    }


# ✅ Obtener usuario actual desde token
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if not user:
        raise credentials_exception

    return user


# ✅ Cerrar sesión (el token expira solo)
@router.post("/cerrar-sesion")
def logout():
    return {"message": "Sesión cerrada (el token expirará automáticamente)"}