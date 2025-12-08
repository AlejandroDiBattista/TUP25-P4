from sqlmodel import create_engine, SQLModel, Session
from pathlib import Path

# Crear el directorio para la base de datos si no existe
Path("data").mkdir(exist_ok=True)

# Conexión a la base de datos SQLite con check_same_thread=False para FastAPI
DATABASE_URL = "sqlite:///data/shop.db"
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False},
    echo=False
)

# Función para crear las tablas
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# Función para obtener una sesión de base de datos
def get_session():
    with Session(engine) as session:
        yield session