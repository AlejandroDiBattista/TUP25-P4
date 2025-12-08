from typing import List, Optional

from pydantic import BaseModel, EmailStr, root_validator


class UserCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: str

    @root_validator(pre=True)
    def ensure_identifier(cls, values):
        username = values.get("username")
        email = values.get("email")
        if not username and not email:
            raise ValueError("username o email es requerido")
        return values

    def normalized_email(self) -> str:
        identifier = self.email or self.username
        if not identifier:
            raise ValueError("Identificador inválido")
        return identifier.strip().lower()


class ProductRead(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    precio: float
    categoria: Optional[str]
    existencia: int
    imagen: Optional[str]


class CartItemCreate(BaseModel):
    producto_id: int
    cantidad: int


class PurchaseItemRead(BaseModel):
    producto_id: int
    cantidad: int
    nombre: Optional[str]
    precio_unitario: float
    iva: Optional[float]
    iva_rate: Optional[float]


class PurchaseRead(BaseModel):
    id: int
    fecha: str
    direccion: Optional[str]
    total: float
    envio: float
    iva_total: float
    items: Optional[List[PurchaseItemRead]]
