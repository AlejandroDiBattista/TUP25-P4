from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt


# Contexto de hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Clave secreta y algoritmo
SECRET_KEY = "clave_super_secreta"  # Podés moverla a .env si querés
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Hasheo y verificación de contraseñas
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Generación de token JWT
def crear_token(datos: dict) -> str:
    to_encode = datos.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({
        "exp": expire,
        "sub": datos["sub"]  # ✅ usamos "sub" como estándar
    })
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def obtener_usuario_actual(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")


