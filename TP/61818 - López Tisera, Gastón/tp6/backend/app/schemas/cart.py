from datetime import datetime

from pydantic import BaseModel, Field


class CartItemBase(BaseModel):
    producto_id: int = Field(..., gt=0)
    cantidad: int = Field(..., ge=1)


class CartItemCreate(BaseModel):
    producto_id: int = Field(..., gt=0)
    cantidad: int  # Sin restricción de mínimo para permitir decrementos


class CartItemRead(CartItemBase):
    id: int

    class Config:
        from_attributes = True


class CartRead(BaseModel):
    id: int
    estado: str
    created_at: datetime
    updated_at: datetime
    items: list[CartItemRead]

    class Config:
        from_attributes = True


class CheckoutRequest(BaseModel):
    direccion: str
    tarjeta: str


