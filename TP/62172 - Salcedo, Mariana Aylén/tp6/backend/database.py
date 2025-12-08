from sqlmodel import SQLModel, create_engine, Session
from pathlib import Path

# Configuración de la base de datos
DATABASE_PATH = Path(__file__).parent / "ecommerce.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# Crear el engine
engine = create_engine(DATABASE_URL, echo=True, connect_args={"check_same_thread": False})

def create_db_and_tables():
    """Crear la base de datos y las tablas"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Obtener una sesión de base de datos"""
    with Session(engine) as session:
        yield session

# Configuración JWT
SECRET_KEY = "tu_clave_secreta_super_segura_cambiala_en_produccion_2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 horas
