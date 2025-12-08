from __future__ import annotations

"""Infraestructura de base de datos para el backend (FASE 1).

Provee:
- engine: motor SQLAlchemy/SQLModel apuntando a SQLite local
- create_db_and_tables(): crea todas las tablas de los modelos si no existen
- get_session(): context manager que entrega una sesión lista para usar

Notas:
- Usamos una ruta absoluta hacia database.db para evitar problemas con el cwd.
- Las importaciones de modelos se hacen dentro de create_db_and_tables para
  registrar correctamente la metadata antes de create_all y evitar ciclos.
"""

from contextlib import contextmanager
from pathlib import Path
from sqlmodel import SQLModel, Session, create_engine

# Archivo de base de datos a nivel de carpeta "backend"
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Motor compartido (check_same_thread=False para SQLite en entornos async)
engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)


def create_db_and_tables() -> None:
    """Crea todas las tablas declaradas en los modelos si no existen."""
    # Importación perezosa para asegurar que los modelos registren su metadata
    # y a la vez evitar ciclos de importación.
    import models  # noqa: F401

    SQLModel.metadata.create_all(engine)


@contextmanager
def get_session() -> Session:
    """Entregar una sesión de base de datos como context manager.

    Ejemplo de uso:
        with get_session() as session:
            ...
    """
    with Session(engine) as session:
        yield session
from pathlib import Path
from sqlmodel import SQLModel, create_engine, Session

DATABASE_PATH = Path(__file__).resolve().parent.parent / "database.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})

def init_db():
    """Compatibilidad: inicializa tablas. Usar create_db_and_tables() en código nuevo."""
    import models  # noqa: F401  (registro de modelos)
    SQLModel.metadata.create_all(engine)

def create_db_and_tables():
    """FASE 1: función explícita solicitada para crear las tablas en SQLite."""
    init_db()

def get_session():
    return Session(engine)
