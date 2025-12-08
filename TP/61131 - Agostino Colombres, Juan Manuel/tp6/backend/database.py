"""Utilidades de base de datos para el backend FastAPI."""

from collections.abc import Iterator

from sqlmodel import Session, SQLModel, create_engine

DATABASE_URL = "sqlite:///./database.db"

engine = create_engine(DATABASE_URL, echo=False)


def create_db_and_tables() -> None:
    """Crea las tablas definidas en los modelos si no existen."""
    from models import Carrito, CarritoItem, Compra, CompraItem, Producto, Usuario 

    SQLModel.metadata.create_all(engine)


def get_session() -> Iterator[Session]:
    """Dependencia para FastAPI que entrega una sesión de base de datos."""
    with Session(engine) as session:
        yield session
