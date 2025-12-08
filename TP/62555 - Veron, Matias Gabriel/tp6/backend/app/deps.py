from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from .database import get_session
from .auth import decode_token
from app.models.usuarios import Usuario

bearer = HTTPBearer(auto_error=False)

def get_current_user(
    cred: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_session),
):
    if not cred:
        raise HTTPException(status_code=401, detail="Token requerido")
    email = decode_token(cred.credentials)
    if not email:
        raise HTTPException(status_code=401, detail="Token inválido")
    user = db.exec(select(Usuario).where(Usuario.email == email)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user
