from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    nombre: str = Field(..., max_length=100)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserRead(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

