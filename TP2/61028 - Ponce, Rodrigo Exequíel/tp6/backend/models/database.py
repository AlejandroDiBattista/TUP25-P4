from sqlmodel import SQLModel, create_engine, Session

# Configuración de la base de datos SQLite
DATABASE_URL = "sqlite:///./tienda.db"
engine = create_engine(DATABASE_URL)

# Función para crear todas las tablas
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session