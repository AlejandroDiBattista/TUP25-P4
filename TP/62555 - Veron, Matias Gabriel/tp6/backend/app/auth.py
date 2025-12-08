from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.hash import pbkdf2_sha256

SECRET = "tp6_secret_key"
ALGO = "HS256"
EXP_MIN = 60 * 24  # 24 horas

def hash_password(p: str) -> str:
    """
    Hash password using PBKDF2-SHA256 to avoid bcrypt's 72-byte limit and
    potential backend binding issues. PBKDF2 is secure for this university
    project and simpler to run in local environments.
    """
    if not isinstance(p, str):
        p = str(p)
    return pbkdf2_sha256.hash(p)


def verify_password(p: str, h: str) -> bool:
    if not isinstance(p, str):
        p = str(p)
    return pbkdf2_sha256.verify(p, h)

def create_token(email: str):
    exp = datetime.utcnow() + timedelta(minutes=EXP_MIN)
    return jwt.encode({"sub": email, "exp": exp}, SECRET, algorithm=ALGO)

def decode_token(token: str):
    try:
        data = jwt.decode(token, SECRET, algorithms=[ALGO])
        return data.get("sub")
    except JWTError:
        return None
