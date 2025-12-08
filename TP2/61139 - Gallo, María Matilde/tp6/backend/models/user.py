from sqlmodel import SQLModel, Field, UniqueConstraint
from typing import Optional

class User(SQLModel, table=True):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("email", name="uq_user_email"),)
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: str
    password_hash: str


