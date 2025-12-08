from pydantic import BaseModel


class ProductoRead(BaseModel):
    id: int
    nombre: str
    descripcion: str
    precio: float
    categoria: str
    existencia: int
    valoracion: float | None = None
    imagen: str | None = None

    class Config:
        from_attributes = True
