"""Compatibilidad: delega toda la infraestructura de DB al módulo moderno app.database.

Este archivo existe solo para no romper scripts antiguos que importaban
`db.engine`, `db.get_session()` o `db.create_db()`.
"""

from app.database import (  # type: ignore
    engine,
    get_session as _get_session,
    create_db_and_tables as _create_db_and_tables,
)
from sqlmodel import Session


def get_session() -> Session:
    """Wrapper compatible."""
    return _get_session()


def create_db() -> None:
    """Wrapper compatible (equivalente a create_db_and_tables)."""
    _create_db_and_tables()
