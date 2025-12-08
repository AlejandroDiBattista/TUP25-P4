
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_registro_y_login():
    r = client.post(
        "/registrar",
        json={"nombre": "Prueba", "correo": "prueba@example.com", "password": "123456"},
    )
    assert r.status_code == 200
    r = client.post(
        "/iniciar-sesion",
        json={"correo": "prueba@example.com", "password": "123456"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
