from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.pool import StaticPool
from pathlib import Path

# Crear la BD en el directorio actual
DATABASE_URL = "sqlite:///./tienda.db"

# Configuración del engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

def create_db_and_tables():
    """Crear las tablas en la base de datos"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Obtener una sesión de base de datos"""
    with Session(engine) as session:
        yield session
