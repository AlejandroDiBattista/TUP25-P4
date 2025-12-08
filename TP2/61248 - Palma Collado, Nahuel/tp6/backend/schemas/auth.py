from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class Credenciales(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expira_en: datetime