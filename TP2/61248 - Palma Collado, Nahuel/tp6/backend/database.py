import json
from pathlib import Path
import os
from typing import Iterable

from sqlmodel import Session, SQLModel, create_engine, select

from models import (
    Carrito,
    CarritoItem,
    Compra,
    CompraItem,
    Producto,
    TokenRevocado,
    Usuario,
)

# Importaciones necesarias para registrar los modelos en la metadata de SQLModel.

DATABASE_FILE = Path(__file__).parent / "app.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATABASE_FILE}")

engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)


def create_db_and_tables() -> None:
    """Create database tables and seed initial data when needed."""
    SQLModel.metadata.create_all(engine)
    _seed_productos()


def get_session() -> Iterable[Session]:
    """FastAPI dependency that provides a scoped SQLModel session."""
    with Session(engine) as session:
        yield session


def _seed_productos() -> None:
    """Populate the products table from productos.json when it's empty."""
    with Session(engine) as session:
        existing = session.exec(select(Producto).limit(1)).first()
        if existing is not None:
            return

        ruta_json = Path(__file__).parent / "productos.json"
        if not ruta_json.exists():
            raise FileNotFoundError(
                "No se encontró el archivo productos.json para inicializar la base"
            )

        with ruta_json.open("r", encoding="utf-8") as archivo:
            productos = json.load(archivo)

        for producto in productos:
            session.add(
                Producto(
                    id=producto.get("id"),
                    nombre=producto.get("titulo", producto.get("nombre", "")),
                    descripcion=producto.get("descripcion", ""),
                    precio=producto.get("precio", 0.0),
                    categoria=producto.get("categoria", ""),
                    existencia=producto.get("existencia", 0),
                    valoracion=producto.get("valoracion"),
                    imagen=producto.get("imagen"),
                )
            )
        session.commit()
