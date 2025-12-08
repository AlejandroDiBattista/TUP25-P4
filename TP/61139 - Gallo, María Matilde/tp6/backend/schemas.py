from pydantic import BaseModel, EmailStr

class RegisterIn(BaseModel):
    nombre: str
    email: EmailStr
    password: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str

class AddToCartIn(BaseModel):
    producto_id: int
    cantidad: int = 1

class CheckoutIn(BaseModel):
    direccion: str
    tarjeta: str

