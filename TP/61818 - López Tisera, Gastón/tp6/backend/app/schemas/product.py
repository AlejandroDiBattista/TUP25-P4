from pydantic import BaseModel


class ProductBase(BaseModel):
    titulo: str
    descripcion: str
    precio: float
    categoria: str
    valoracion: float
    existencia: int
    imagen: str


class ProductRead(ProductBase):
    id: int

    class Config:
        from_attributes = True

