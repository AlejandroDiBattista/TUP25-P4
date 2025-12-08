from collections.abc import Iterator

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.database_url,
    echo=False,
    connect_args={"check_same_thread": False}
    if settings.database_url.startswith("sqlite")
    else {},
)


def init_db() -> None:
    """Create database tables."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Iterator[Session]:
    """FastAPI dependency that yields a session."""
    with Session(engine) as session:
        yield session

