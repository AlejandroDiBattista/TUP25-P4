from sqlmodel import SQLModel, create_engine, Session
from contextlib import contextmanager

sqlite_file_name = "database.db"
DATABASE_URL = f"sqlite:///{sqlite_file_name}"

engine = create_engine(
    DATABASE_URL,
    echo=True,
    connect_args={"check_same_thread": False},
    pool_pre_ping=True,
    pool_recycle=3600
)

def crear_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session