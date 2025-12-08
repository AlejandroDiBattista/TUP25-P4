from pathlib import Path
from sqlmodel import create_engine, SQLModel, Session

DATABASE_PATH = Path(__file__).parent / "db.sqlite3"
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    return Session(engine)
