import logging

from fastapi import HTTPException, Request
from sqlmodel import Session

from .. import auth, crud, db
from ..ratelimit import limiter

logger = logging.getLogger("uvicorn")


def extract_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for") if request else None
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request and request.client:
        return request.client.host or "unknown"
    return "unknown"


def perform_login(email: str, password: str, *, client_ip: str) -> str:
    normalized_email = (email or "").strip().lower()
    if not normalized_email:
        raise HTTPException(status_code=400, detail="El email es requerido")
    if not password:
        raise HTTPException(status_code=400, detail="La contraseña es requerida")

    ip_key = f"ip:{client_ip}" if client_ip else "ip:unknown"
    email_key = f"email:{normalized_email}"

    blocked, seconds_left = limiter.is_blocked(ip_key)
    if blocked:
        logger.warning("Login attempt blocked for IP %s, remaining %.0fs", client_ip, seconds_left)
        raise HTTPException(status_code=429, detail="Too many attempts from this IP. Try later.")

    blocked_email, seconds_email = limiter.is_blocked(email_key)
    if blocked_email:
        logger.warning("Login attempt blocked for email %s, remaining %.0fs", normalized_email, seconds_email)
        raise HTTPException(status_code=429, detail="Too many attempts for this account. Try later.")

    with Session(db.engine) as session:
        user = crud.get_user_by_email(session, normalized_email)
        if not user or not auth.verify_password(password, user.hashed_password):
            limiter.add_failure(ip_key)
            limiter.add_failure(email_key)
            raise HTTPException(status_code=401, detail="Incorrect email or password")

        token = auth.create_access_token({"sub": user.email})

    limiter.reset(ip_key)
    limiter.reset(email_key)
    return token
