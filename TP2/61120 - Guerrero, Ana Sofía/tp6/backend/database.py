from sqlmodel import create_engine, Session


DATABASE_URL = "sqlite:///database.db"
engine = create_engine(DATABASE_URL, echo=True)


def get_session():
    """Generador de sesión de base de datos para dependencias de FastAPI."""
    with Session(engine) as session:
        yield session