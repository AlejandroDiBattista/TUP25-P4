from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Compra(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    total: float
    fecha: datetime = Field(default_factory=datetime.utcnow)
