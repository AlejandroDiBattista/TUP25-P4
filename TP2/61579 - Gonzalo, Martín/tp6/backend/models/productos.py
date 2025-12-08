from typing import Optional
from sqlmodel import Field, SQLModel


class Producto(SQLModel, table=True):
    """
    Modelo de Producto para la base de datos.
    Actualizado para coincidir con productos.json.
    """
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Cambiamos 'nombre' por 'titulo' para que coincida con el JSON
    titulo: str = Field(default="", max_length=255) 
    
    descripcion: str = Field(default="")
    precio: float = Field(default=0.0, ge=0)
    categoria: str = Field(default="", max_length=100)
    
    # Agregamos el campo 'valoracion'
    valoracion: float = Field(default=0.0)
    
    existencia: int = Field(default=0, ge=0)
    
    # Guardaremos solo el nombre del archivo (ej: "0001.png")
    imagen: Optional[str] = Field(default=None)
    
    class Config:
        # Asegurar que la serialización sea correcta
        from_attributes = True