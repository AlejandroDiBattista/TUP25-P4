from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session

from .. import auth, crud, db, schemas
from ..services.login_service import extract_client_ip, perform_login
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/registrar", response_model=schemas.Token)
def registrar(user: schemas.UserCreate):
    with Session(db.engine) as session:
        email = user.email.lower()
        existing = crud.get_user_by_email(session, email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        hashed = auth.get_password_hash(user.password)
        created = crud.create_user(session, user.nombre, email, hashed)
        token = auth.create_access_token({"sub": created.email})
        return {"access_token": token}


@router.post("/token", response_model=schemas.Token)
def login(request: Request, payload: schemas.LoginRequest):
    try:
        identifier = payload.normalized_email()
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    token = perform_login(identifier, payload.password, client_ip=extract_client_ip(request))
    return {"access_token": token}


@router.post("/logout")
def logout(token: str = Depends(auth.oauth2_scheme)):
    auth.invalidate_token(token)
    return {"ok": True}
