from pydantic import BaseModel

# Esquema para crear usuario (registro)
class UsuarioCreate(BaseModel):
    nombre: str
    email: str
    password: str 

# Esquema de respuesta 
class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    email: str

    class Config:
        orm_mode = True
