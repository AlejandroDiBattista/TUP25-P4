from sqlmodel import SQLModel, Field

class Producto(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str
    descripcion: str
    precio: float
    categoria: str
    existencia: int
    imagen: str | None = None
