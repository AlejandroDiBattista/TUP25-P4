from typing import Optional

from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    """Return a user by their email address."""
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


def create_user(session: Session, user_in: UserCreate) -> User:
    """Create a new user with hashed password."""
    user = User(
        nombre=user_in.nombre,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def authenticate_user(session: Session, email: str, password: str) -> Optional[User]:
    """Validate a user's credentials."""
    user = get_user_by_email(session, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

