import time
from fastapi.testclient import TestClient
from main import app


client = TestClient(app)


def unique_email():
    return f"test_{int(time.time()*1000)}@example.com"


def test_register_login_logout_flow():
    email = unique_email()
    # register
    resp = client.post("/registrar", json={"nombre": "Tester", "email": email, "password": "secret"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == email or data.get("email") == email

    # login
    resp = client.post("/iniciar-sesion", data={"username": email, "password": "secret"})
    assert resp.status_code == 200
    token_data = resp.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # protected - get productos (no auth required in current impl but use token to test header)
    resp = client.get("/productos", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200

    # logout
    resp = client.post("/cerrar-sesion", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json().get("ok") is True
