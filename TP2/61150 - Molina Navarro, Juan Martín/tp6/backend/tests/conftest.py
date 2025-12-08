import json
from pathlib import Path
from typing import AsyncIterator, Dict, Generator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlmodel import Session, SQLModel, create_engine

import main
from database import get_session as db_get_session
from models import Producto

BASE_DIR = Path(__file__).resolve().parents[1]
PRODUCTOS_PATH = BASE_DIR / "productos.json"


def cargar_productos() -> list[Dict]:
    if not PRODUCTOS_PATH.exists():
        return []
    with PRODUCTOS_PATH.open(encoding="utf-8") as archivo:
        return json.load(archivo)


@pytest.fixture()
def test_engine(tmp_path):
    db_path = tmp_path / "test.db"
    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
    )
    SQLModel.metadata.create_all(engine)
    return engine


def seed_productos(engine) -> None:
    productos = cargar_productos() or [
        {
            "id": 1,
            "titulo": "Producto demo",
            "precio": 100.0,
            "descripcion": "Producto de pruebas",
            "categoria": "general",
            "valoracion": 4.5,
            "existencia": 10,
            "imagen": "imagenes/demo.png",
        }
    ]

    with Session(engine) as session:
        for producto in productos[:5]:
            session.add(Producto(**producto))
        session.commit()


@pytest_asyncio.fixture()
async def client(test_engine) -> AsyncIterator[AsyncClient]:
    SQLModel.metadata.drop_all(test_engine)
    SQLModel.metadata.create_all(test_engine)
    seed_productos(test_engine)
    main.tokens_activos.clear()

    def get_test_session() -> Generator[Session, None, None]:
        with Session(test_engine) as session:
            yield session

    main.app.dependency_overrides[db_get_session] = get_test_session

    transport = ASGITransport(app=main.app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as async_client:
        yield async_client

    main.app.dependency_overrides.pop(db_get_session, None)
