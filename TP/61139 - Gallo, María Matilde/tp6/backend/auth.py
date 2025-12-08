from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET = "super-secret-tp6"
ALGO = "HS256"
bearer = HTTPBearer()

def create_token(user_id: int) -> str:
    payload = {"sub": str(user_id), "exp": datetime.utcnow() + timedelta(hours=8)}
    return jwt.encode(payload, SECRET, algorithm=ALGO)

def current_user_id(token: HTTPAuthorizationCredentials = Depends(bearer)) -> int:
    try:
        data = jwt.decode(token.credentials, SECRET, algorithms=[ALGO])
        return int(data["sub"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")


