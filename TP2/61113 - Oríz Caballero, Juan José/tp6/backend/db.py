from sqlmodel import create_engine, Session
from typing import Generator

DATABASE_URL = "sqlite:///database.db"
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
