from sqlmodel import SQLModel, create_engine, Session
from pathlib import Path

# Crear base de datos SQLite en la carpeta del backend
DB_PATH = Path(__file__).parent / "ecommerce.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Crear engine
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Cambiar a True para ver SQL en consola
    connect_args={"check_same_thread": False}  # Requerido para SQLite
)


def create_db_and_tables():
    """Crear todas las tablas en la base de datos."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Obtener una sesión de base de datos."""
    with Session(engine) as session:
        yield session
