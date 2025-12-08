from __future__ import annotations

import os
from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

import database
from database import get_session
from main import app

TEST_DB_PATH = Path(__file__).parent / "test.db"
TEST_DATABASE_URL = f"sqlite:///{TEST_DB_PATH}"


def _override_database_url() -> None:
    os.environ["DATABASE_URL"] = TEST_DATABASE_URL
    database.DATABASE_URL = TEST_DATABASE_URL
    database.engine = create_engine(
        TEST_DATABASE_URL, echo=False, connect_args={"check_same_thread": False}
    )


@pytest.fixture(autouse=True)
def setup_database() -> Generator[None, None, None]:
    _override_database_url()
    SQLModel.metadata.drop_all(database.engine)
    SQLModel.metadata.create_all(database.engine)
    database._seed_productos()  # type: ignore[attr-defined]
    yield
    SQLModel.metadata.drop_all(database.engine)
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()


@pytest.fixture()
def session() -> Generator[Session, None, None]:
    with Session(database.engine) as session:
        yield session


@pytest.fixture()
def client(session: Session) -> Generator[TestClient, None, None]:
    def override_get_session() -> Generator[Session, None, None]:
        yield session

    app.dependency_overrides[get_session] = override_get_session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()