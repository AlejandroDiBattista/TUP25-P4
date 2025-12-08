import pytest
from fastapi.testclient import TestClient
from main import app
from load_data import load_products
from app import db
from sqlmodel import SQLModel


@pytest.fixture(autouse=True)
def prepare_db():
    SQLModel.metadata.drop_all(db.engine)
    load_products()


def test_logout_invalidation():
    client = TestClient(app)
    # register and get token
    r = client.post("/auth/registrar", json={"nombre": "L", "email": "l@example.com", "password": "pwd"})
    assert r.status_code == 200
    token = r.json().get("access_token")
    assert token

    headers = {"Authorization": f"Bearer {token}"}
    # access protected endpoint should work
    r1 = client.get("/carrito/", headers=headers)
    assert r1.status_code == 200

    # logout
    r2 = client.post("/auth/logout", headers=headers)
    assert r2.status_code == 200

    # subsequent access should be unauthorized
    r3 = client.get("/carrito/", headers=headers)
    assert r3.status_code == 401
