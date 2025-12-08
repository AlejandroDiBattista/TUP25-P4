from pydantic import BaseModel


class UsuarioBase(BaseModel):
    nombre: str
    email: str


class UsuarioRegistro(UsuarioBase):
    password: str


class UsuarioLogin(BaseModel):
    email: str
    password: str


class UsuarioResponse(UsuarioBase):
    id: int

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    usuario: UsuarioResponse
