from pydantic import BaseModel


class ProductoBase(BaseModel):
    titulo: str
    precio: float
    descripcion: str
    categoria: str
    valoracion: float
    existencia: int
    imagen: str


class ProductoResponse(ProductoBase):
    id: int

    class Config:
        from_attributes = True
