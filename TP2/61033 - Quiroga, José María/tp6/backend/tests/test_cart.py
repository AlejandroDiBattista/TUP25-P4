import time
from fastapi.testclient import TestClient
from main import app
from db import engine
from sqlmodel import Session, select
from core_models import Product, Purchase, PurchaseItem


client = TestClient(app)


def unique_name():
    return f"PR_{int(time.time()*1000)}"


def test_cart_and_finalize_flow():
    # create product directly in DB
    nombre = unique_name()
    with Session(engine) as session:
        prod = Product(nombre=nombre, descripcion="desc", precio=100.0, categoria="Ropa", existencia=3)
        session.add(prod)
        session.commit()
        session.refresh(prod)
        product_id = prod.id

    email = f"cart_{int(time.time()*1000)}@example.com"
    # register
    resp = client.post("/registrar", json={"nombre": "CartUser", "email": email, "password": "secret"})
    assert resp.status_code == 200

    # login
    resp = client.post("/iniciar-sesion", data={"username": email, "password": "secret"})
    assert resp.status_code == 200
    token = resp.json()["access_token"]

    # add to cart
    resp = client.post("/carrito", json={"product_id": product_id, "cantidad": 2}, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200

    # view cart
    resp = client.get("/carrito", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 200.0

    # finalize
    resp = client.post("/carrito/finalizar", json={"direccion": "Calle 1", "tarjeta": "4111"}, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    body = resp.json()
    assert body.get("ok") is True
    compra_id = body.get("compra_id")
    assert compra_id is not None

    # verify purchase in DB and stock decremented
    with Session(engine) as session:
        compra = session.get(Purchase, compra_id)
        assert compra is not None
        items = session.exec(select(PurchaseItem).where(PurchaseItem.compra_id == compra_id)).all()
        assert len(items) == 1
        p = session.get(Product, product_id)
        assert p.existencia == 1  # 3 - 2
