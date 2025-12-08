import sys
from pathlib import Path

# Añadir el directorio actual al path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi.testclient import TestClient
import traceback

from main import app


def run():
    client = TestClient(app)
    try:
        # Registrar
        resp = client.post("/registrar", json={"nombre": "Smoke", "email": "smoke@example.com", "password": "12345"})
        assert resp.status_code == 200, f"registrar failed: {resp.status_code} {resp.text}"

        # Iniciar sesión
        resp = client.post("/iniciar-sesion", json={"email": "smoke@example.com", "password": "12345"})
        assert resp.status_code == 200, f"login failed: {resp.status_code} {resp.text}"
        token = resp.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}

        # Listar productos
        resp = client.get("/productos")
        assert resp.status_code == 200
        productos = resp.json()
        assert isinstance(productos, list) and len(productos) > 0
        prod_id = productos[0]["id"]

        # Agregar al carrito
        resp = client.post("/carrito", json={"product_id": prod_id, "cantidad": 1}, headers=headers)
        assert resp.status_code == 200

        # Finalizar
        resp = client.post("/carrito/finalizar", json={"direccion": "Calle 1", "tarjeta": "1111"}, headers=headers)
        assert resp.status_code == 200

        print("SMOKE OK")
        return 0
    except Exception:
        traceback.print_exc()
        print("SMOKE FAIL")
        return 2


if __name__ == '__main__':
    sys.exit(run())
