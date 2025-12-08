from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from database import crear_tablas, get_session, engine
# from passlib.context import CryptContext

# 1. Configuración de Seguridad
SECRET_KEY = "MiramiContratieneNumerito123454seguraNo"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 # Duración del token

BCRYPT_MAX_LENGTH = 72

# Define el esquema de seguridad (le dice a FastAPI cómo esperar el token)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="iniciar-sesion")

# Contexto para el hashing de contraseñas
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- HASHING DE CONTRASENAS ---
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si la contraseña plana coincide con el hash."""
    # return pwd_context.verify(plain_password, hashed_password)
    return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    """Genera el hash de una contraseña."""
    # password_bytes = password.encode('utf-8')

    # if len(password_bytes) > BCRYPT_MAX_LENGTH:
    #     password = password_bytes[:BCRYPT_MAX_LENGTH].decode('utf-8', 'ignore')

    # return pwd_context.hash(password)
    return password

# --- GENERACION DE JWT ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crea un nuevo token JWT."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Agrega la expiración y el tipo de token (sub)
    to_encode.update({"exp": expire, "sub": "access"})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# main.py

# Dependencia para obtener el usuario autenticado
async def get_current_user(
    token: str = Depends(oauth2_scheme), # Recibe el token del encabezado Authorization
    session: Session = Depends(get_session)
) -> Usuario:

    try:
        # Decodificar el token con la clave secreta
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # El user_id fue almacenado en el token como str, lo extraemos.
        user_id_str: Optional[str] = payload.get("user_id")
        
        if user_id_str is None:
            raise CREDENTIALS_EXCEPTION
            
        # Convertir a entero, que es el tipo del ID en la DB
        user_id_int = int(user_id_str)

    except (JWTError, ValueError):
        # Captura errores de JWT (firma, expiración) o si user_id_str no es un número.
        raise CREDENTIALS_EXCEPTION 

    # 2. Buscar el usuario en la DB por el ID en el token
    user = session.get(Usuario, user_id_int)
    
    if user is None:
        raise CREDENTIALS_EXCEPTION # Usuario ya no existe, pero tiene un token válido
        
    return user # ¡Éxito! Retorna el objeto Usuario

# --- GESTION DE ERRORES ---
CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="No se pudieron validar las credenciales",
    headers={"WWW-Authenticate": "Bearer"},
)