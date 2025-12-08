from __future__ import annotations

from pathlib import Path
from typing import Iterator

from sqlmodel import Session, SQLModel, create_engine

DATABASE_PATH = Path(__file__).parent / "app.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH.as_posix()}"

engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)


def init_db() -> None:
    # Import tardío para registrar los modelos antes de crear las tablas
    from models import (
        Carrito,
        CarritoItem,
        Compra,
        CompraItem,
        Producto,
        Usuario,
    )  # noqa: F401

    SQLModel.metadata.create_all(engine)


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session
