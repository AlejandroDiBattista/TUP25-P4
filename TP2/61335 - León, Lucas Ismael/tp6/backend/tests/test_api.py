import os
import sys
import tempfile
import time
import uuid
from pathlib import Path
from typing import Optional

import pytest
from fastapi.testclient import TestClient

# Asegurar que el directorio raíz del backend esté en sys.path para `from main import app`
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


def make_client():
    # Usar una base de datos temporal por test run
    tmpdir = tempfile.TemporaryDirectory()
    db_path = os.path.join(tmpdir.name, "test_ecommerce.db")
    os.environ["DB_PATH"] = db_path

    # Importar la app después de setear DB_PATH y crear tablas/seed explícitamente
    from main import app, crear_bd_y_tablas, engine, seed_productos
    from sqlmodel import Session

    crear_bd_y_tablas()
    with Session(engine) as s:
        seed_productos(s)

    client = TestClient(app)
    # Adjuntar el temporary dir para que no se coleccione
    client._tmpdir = tmpdir  # type: ignore[attr-defined]
    return client


def auth_headers(token: str):
    return {"Authorization": f"Bearer {token}"}


def do_register_and_login(client: TestClient, email: Optional[str] = None, password: str = "pwd12345"):
    email = email or f"test_{uuid.uuid4().hex}@example.com"
    # Registrar
    r = client.post("/registrar", json={"nombre": "Test", "email": email, "password": password})
    assert r.status_code in (201, 400)
    # Login (OAuth2PasswordRequestForm usa x-www-form-urlencoded con 'username' y 'password')
    r = client.post(
        "/iniciar-sesion",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    return token


def test_root_and_productos_list():
    client = make_client()
    r = client.get("/")
    assert r.status_code == 200
    assert "mensaje" in r.json()

    r = client.get("/productos")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_auth_and_carrito_cancel_flow():
    client = make_client()
    token = do_register_and_login(client)

    # Ver carrito vacío
    r = client.get("/carrito", headers=auth_headers(token))
    assert r.status_code == 200
    body = r.json()
    assert set(body.keys()) == {"items", "subtotal", "iva", "envio", "total"}

    # Elegir un producto para agregar
    productos = client.get("/productos").json()
    assert len(productos) > 0
    prod = next((p for p in productos if p.get("existencia", 0) > 0), productos[0])

    r = client.post("/carrito", json={"producto_id": prod["id"], "cantidad": 1}, headers=auth_headers(token))
    assert r.status_code == 201
    assert r.json()["mensaje"] == "Producto agregado"

    # Cancelar carrito
    r = client.post("/carrito/cancelar", headers=auth_headers(token))
    assert r.status_code == 200
    assert r.json()["mensaje"] == "Carrito cancelado"


def test_checkout_empty_cart_returns_400_and_logout_blacklist():
    client = make_client()
    token = do_register_and_login(client)

    # Finalizar con carrito vacío -> 400
    r = client.post(
        "/carrito/finalizar",
        json={"direccion": "Calle 1", "tarjeta": "4111111111111111"},
        headers=auth_headers(token),
    )
    assert r.status_code == 400

    # Logout
    r = client.post("/cerrar-sesion", headers=auth_headers(token))
    assert r.status_code == 200
    assert r.json()["mensaje"] == "Sesión cerrada"

    # El token ya no debe permitir acceder
    r = client.get("/carrito", headers=auth_headers(token))
    assert r.status_code == 401


def test_checkout_flow_decrements_stock():
    client = make_client()
    token = do_register_and_login(client)

    # Obtener un producto con stock > 1
    productos = client.get("/productos").json()
    prod = next((p for p in productos if p.get("existencia", 0) >= 2), productos[0])
    original_stock = prod["existencia"]

    # Agregar 2 unidades
    r = client.post("/carrito", json={"producto_id": prod["id"], "cantidad": 2}, headers=auth_headers(token))
    assert r.status_code == 201

    # Finalizar compra
    r = client.post(
        "/carrito/finalizar",
        json={"direccion": "Av Siempre Viva 742", "tarjeta": "4111111111111111"},
        headers=auth_headers(token),
    )
    assert r.status_code == 200
    compra_id = r.json()["compra_id"]
    assert isinstance(compra_id, int)

    # Ver historial contiene la compra
    r_hist = client.get("/compras", headers=auth_headers(token))
    assert r_hist.status_code == 200
    compras = r_hist.json()
    assert any(c["id"] == compra_id for c in compras)

    # Ver producto actualizado (stock reducido)
    r_prod = client.get(f"/productos/{prod['id']}")
    assert r_prod.status_code == 200
    nuevo_stock = r_prod.json()["existencia"]
    assert nuevo_stock == original_stock - 2


def test_patch_carrito_actualiza_y_elimina():
    client = make_client()
    token = do_register_and_login(client)

    # Tomar un producto con stock
    productos = client.get("/productos").json()
    prod = next((p for p in productos if p.get("existencia", 0) >= 3), productos[0])

    # Agregar 1 unidad
    r = client.post("/carrito", json={"producto_id": prod["id"], "cantidad": 1}, headers=auth_headers(token))
    assert r.status_code == 201

    # Actualizar a 3 unidades
    r = client.patch("/carrito", json={"producto_id": prod["id"], "cantidad": 3}, headers=auth_headers(token))
    assert r.status_code == 200

    # Verificar resumen refleja 3 unidades
    r = client.get("/carrito", headers=auth_headers(token))
    assert r.status_code == 200
    resumen = r.json()
    item = next((it for it in resumen["items"] if it["producto_id"] == prod["id"]), None)
    assert item is not None and item["cantidad"] == 3

    # Poner cantidad 0 elimina el item
    r = client.patch("/carrito", json={"producto_id": prod["id"], "cantidad": 0}, headers=auth_headers(token))
    assert r.status_code == 200

    r = client.get("/carrito", headers=auth_headers(token))
    assert r.status_code == 200
    resumen2 = r.json()
    assert all(it["producto_id"] != prod["id"] for it in resumen2["items"]) 
