from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel


class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    fecha: datetime = Field(default_factory=datetime.now)
    total: float = Field(ge=0)
    direccion: str
    tarjeta: str = Field(max_length=4)
    estado: str = Field(default="completada", max_length=50)
