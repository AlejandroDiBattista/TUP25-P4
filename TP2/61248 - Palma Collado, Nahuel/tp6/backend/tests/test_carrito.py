from __future__ import annotations

from fastapi.testclient import TestClient


def _registrar_y_login(client: TestClient) -> str:
    client.post(
        "/registrar",
        json={"nombre": "Carlos", "email": "carlos@example.com", "password": "Clave1234"},
    )
    login = client.post(
        "/iniciar-sesion",
        json={"email": "carlos@example.com", "password": "Clave1234"},
    )
    token = login.json()["access_token"]
    return token


def _auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_carrito_flujo_completo(client: TestClient) -> None:
    token = _registrar_y_login(client)

    vacio = client.get("/carrito", headers=_auth_headers(token))
    assert vacio.status_code == 200
    assert vacio.json()["total_items"] == 0

    agregar = client.post(
        "/carrito",
        headers=_auth_headers(token),
        json={"producto_id": 1, "cantidad": 2},
    )
    assert agregar.status_code == 200
    data = agregar.json()
    assert data["total_items"] == 2
    assert data["subtotal"] > 0

    quitar = client.delete("/carrito/1", headers=_auth_headers(token))
    assert quitar.status_code == 200
    assert quitar.json()["total_items"] == 0


def test_finalizar_compra(client: TestClient) -> None:
    token = _registrar_y_login(client)
    client.post(
        "/carrito",
        headers=_auth_headers(token),
        json={"producto_id": 2, "cantidad": 1},
    )

    finalizar = client.post(
        "/carrito/finalizar",
        headers=_auth_headers(token),
        json={"direccion": "Av. Siempre Viva 742", "tarjeta": "4111-1111-1111-1111"},
    )
    assert finalizar.status_code == 200
    payload = finalizar.json()
    assert payload["compra"]["total"] > 0
    assert payload["carrito"]["total_items"] == 0

    historial = client.get("/compras", headers=_auth_headers(token))
    assert historial.status_code == 200
    assert len(historial.json()) == 1

    detalle = client.get("/compras/1", headers=_auth_headers(token))
    assert detalle.status_code == 200
    assert detalle.json()["items"][0]["producto_id"] == 2


def test_carrito_requiere_autenticacion(client: TestClient) -> None:
    respuesta = client.get("/carrito")
    assert respuesta.status_code == 401

