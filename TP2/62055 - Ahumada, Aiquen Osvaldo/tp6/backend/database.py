# backend/database.py
from sqlmodel import SQLModel, create_engine, Session
from pathlib import Path

DB_FILE = Path(__file__).parent / "database.db"
DATABASE_URL = f"sqlite:///{DB_FILE}"

# create_engine con check_same_thread False para uso con FastAPI + SQLite
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    """
    Retorna una sesión (context manager style):
    with get_session() as session:
        ...
    """
    with Session(engine) as session:
        yield session
