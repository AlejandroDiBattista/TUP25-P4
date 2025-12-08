from sqlmodel import SQLModel, create_engine, Session

# Nombre del archivo de base de datos SQLite
DATABASE_URL = "sqlite:///./database.db"

engine = create_engine(DATABASE_URL, echo=True)

# Crear las tablas
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# Obtener sesión para interactuar con la base
def get_session():
    with Session(engine) as session:
        yield session
