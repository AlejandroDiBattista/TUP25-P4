import sys
from pathlib import Path

# Añadir el directorio `backend` al path para poder importar `main` directamente
backend_dir = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from main import app


client = TestClient(app)


def test_registrar_e_iniciar_y_comprar():
    # Registrar
    resp = client.post("/registrar", json={"nombre": "Test", "email": "test@example.com", "password": "secret"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "test@example.com"

    # Iniciar sesión
    resp = client.post("/iniciar-sesion", json={"email": "test@example.com", "password": "secret"})
    assert resp.status_code == 200
    token = resp.json().get("access_token")
    assert token

    headers = {"Authorization": f"Bearer {token}"}

    # Listar productos
    resp = client.get("/productos")
    assert resp.status_code == 200
    productos = resp.json()
    assert isinstance(productos, list)
    assert len(productos) > 0
    prod_id = productos[0]["id"]

    # Agregar al carrito
    resp = client.post("/carrito", json={"product_id": prod_id, "cantidad": 1}, headers=headers)
    assert resp.status_code == 200

    # Ver carrito
    resp = client.get("/carrito", headers=headers)
    assert resp.status_code == 200
    carrito = resp.json()
    assert carrito["items"]

    # Finalizar compra
    resp = client.post("/carrito/finalizar", json={"direccion": "Calle Falsa 123", "tarjeta": "****-****-****-1234"}, headers=headers)
    assert resp.status_code == 200
    compra = resp.json()
    assert "compra_id" in compra
