from pydantic import BaseModel, EmailStr, Field


class UsuarioCreate(BaseModel):
    nombre: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class UsuarioPublic(BaseModel):
    id: int
    nombre: str
    email: EmailStr

    class Config:
        from_attributes = True
