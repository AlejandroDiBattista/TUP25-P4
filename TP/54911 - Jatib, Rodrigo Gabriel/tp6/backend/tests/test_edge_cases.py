import pytest
from fastapi.testclient import TestClient
from main import app
from load_data import load_products
from app import db
from app.models import Product
from sqlmodel import SQLModel, Session


@pytest.fixture(autouse=True)
def prepare_db():
    # reset DB state between tests
    SQLModel.metadata.drop_all(db.engine)
    load_products()


def register_and_token(client: TestClient, email: str = "u@example.com"):
    resp = client.post("/auth/registrar", json={"nombre": "U", "email": email, "password": "pwd"})
    assert resp.status_code == 200
    return resp.json()["access_token"]


def test_add_more_than_stock():
    client = TestClient(app)
    token = register_and_token(client, "stocktest@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # get product 1 to inspect existencia
    r = client.get("/productos/1")
    assert r.status_code == 200
    existencia = r.json().get("existencia", 0)

    # try to add more than existencia
    r2 = client.post("/carrito/", json={"producto_id": 1, "cantidad": existencia + 10}, headers=headers)
    assert r2.status_code == 400


def test_add_product_no_stock():
    client = TestClient(app)
    token = register_and_token(client, "nostock@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # set product 2 existencia to 0 directly in DB
    with Session(db.engine) as session:
        prod = session.get(Product, 2)
        prod.existencia = 0
        session.add(prod)
        session.commit()

    r = client.post("/carrito/", json={"producto_id": 2, "cantidad": 1}, headers=headers)
    assert r.status_code == 400


def test_finalize_empty_cart():
    client = TestClient(app)
    token = register_and_token(client, "emptycart@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    r = client.post("/carrito/finalizar", json={"direccion": "X", "tarjeta": "4111"}, headers=headers)
    assert r.status_code == 400


def test_unauthenticated_access():
    client = TestClient(app)
    r = client.post("/carrito/", json={"producto_id": 1, "cantidad": 1})
    assert r.status_code == 401


def test_remove_after_finalized():
    client = TestClient(app)
    token = register_and_token(client, "afterfinal@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # add item
    r = client.post("/carrito/", json={"producto_id": 1, "cantidad": 1}, headers=headers)
    assert r.status_code == 200

    # finalize
    rf = client.post("/carrito/finalizar", json={"direccion": "X", "tarjeta": "4111"}, headers=headers)
    assert rf.status_code == 200

    # attempt to remove same product (should fail - item not found / cannot delete finalized)
    rr = client.delete("/carrito/1", headers=headers)
    assert rr.status_code == 400
