from pydantic import BaseModel, Field


class ItemCarritoCreate(BaseModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class CheckoutRequest(BaseModel):
    direccion: str = Field(min_length=1, max_length=255)
    tarjeta: str = Field(min_length=12, max_length=32)


class ItemCarritoRead(BaseModel):
    producto_id: int
    nombre: str
    precio: float
    cantidad: int
    subtotal: float
    imagen: str | None = None


class CarritoRead(BaseModel):
    id: int
    estado: str
    total: float
    items: list[ItemCarritoRead]


class CheckoutResponse(BaseModel):
    compra_id: int
    subtotal: float
    iva: float
    envio: float
    total: float
