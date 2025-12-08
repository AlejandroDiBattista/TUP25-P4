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


def test_full_purchase_flow():
    client = TestClient(app)
    # register
    r = client.post("/auth/registrar", json={"nombre": "Buyer", "email": "buyer@example.com", "password": "pwd123"})
    assert r.status_code == 200
    token = r.json().get("access_token")
    assert token

    headers = {"Authorization": f"Bearer {token}"}

    # add product id 1 to cart
    r2 = client.post("/carrito/", json={"producto_id": 1, "cantidad": 2}, headers=headers)
    assert r2.status_code == 200

    # view cart
    r3 = client.get("/carrito/", headers=headers)
    assert r3.status_code == 200
    data = r3.json()
    assert data["items"] and data["items"][0]["producto_id"] == 1

    # finalize with address and card
    r4 = client.post("/carrito/finalizar", json={"direccion": "Calle Falsa 123", "tarjeta": "4111111111111111"}, headers=headers)
    assert r4.status_code == 200
    body = r4.json()
    assert body.get("ok") is True
    assert body.get("total") is not None

    # purchases list
    r5 = client.get("/compras/", headers=headers)
    assert r5.status_code == 200
    purchases = r5.json()
    assert len(purchases) >= 1
