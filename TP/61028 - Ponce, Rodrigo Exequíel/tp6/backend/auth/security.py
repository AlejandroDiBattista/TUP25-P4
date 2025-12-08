import bcrypt
from datetime import datetime, timedelta, timezone # Import 'timezone'
from typing import Optional
from jose import JWTError, jwt
# from passlib.context import CryptContext # <-- Eliminado
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from models.database import engine # <-- Tu código usa 'engine'
from models.models import Usuario

# Configuración de seguridad (la tuya)
SECRET_KEY = "tu_clave_secreta_muy_segura_cambiar_en_produccion"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- REEMPLAZO DE PASSLIB POR BCRYPT ---

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # <-- Usando tu 'tokenUrl'

def verificar_password(password_plano: str, password_hash: str) -> bool:
    """
    Compara una contraseña plana con un hash usando bcrypt.
    """
    try:
        # Convertir ambas a bytes, que es lo que bcrypt espera
        plain_password_bytes = password_plano.encode('utf-8')
        hashed_password_bytes = password_hash.encode('utf-8')
        
        # bcrypt.checkpw hace la comparación de forma segura
        return bcrypt.checkpw(plain_password_bytes, hashed_password_bytes)
    except Exception:
        # Si el hash es inválido o algo falla, devuelve False
        return False

def get_password_hash(password: str) -> str:
    """
    Genera un hash de contraseña usando bcrypt.
    """
    # Convertir la contraseña a bytes
    password_bytes = password.encode('utf-8')
    
    # Generar un "salt" (factor de aleatoriedad)
    salt = bcrypt.gensalt()
    
    # Generar el hash
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)
    
    # Devolver el hash como un string (utf-8) para guardarlo en la BD
    return hashed_bytes.decode('utf-8')

# --- FIN DEL REEMPLAZO ---


def crear_token_acceso(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        # Usamos datetime.now(timezone.utc) que es la forma moderna
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Tu función get_usuario_actual (sin cambios)
async def get_usuario_actual(token: str = Depends(oauth2_scheme)) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    with Session(engine) as session:
        statement = select(Usuario).where(Usuario.email == email)
        usuario = session.exec(statement).first()
        if usuario is None:
            raise credentials_exception
        return usuario