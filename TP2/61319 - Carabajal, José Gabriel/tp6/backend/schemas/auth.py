from pydantic import BaseModel, EmailStr

class RegisterIn(BaseModel):
    nombre: str
    email: EmailStr
    password: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    nombre: str
    email: EmailStr

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
