import pytest
from fastapi.testclient import TestClient
from main import app
from load_data import load_products
from app import db
from sqlmodel import SQLModel


@pytest.fixture(autouse=True)
def prepare_db():
    # drop/create tables to ensure fresh state
    SQLModel.metadata.drop_all(db.engine)
    load_products()


def test_register_and_login():
    client = TestClient(app)
    # Register user
    resp = client.post("/auth/registrar", json={"nombre": "Test", "email": "t@example.com", "password": "secret"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data

    # Login via token endpoint (simulate form)
    resp2 = client.post("/auth/token", json={"username": "t@example.com", "password": "secret"})
    assert resp2.status_code == 200
    assert "access_token" in resp2.json()
