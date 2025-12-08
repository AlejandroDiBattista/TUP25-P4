"""
Tests para el proceso de finalización de compra (checkout).
"""

import pytest
from fastapi.testclient import TestClient

from app.models.product import Product
from app.models.user import User


def test_checkout_success(
    client: TestClient, auth_token: str, test_products: list[Product]
):
    """Test: Finalizar compra exitosamente."""
    # Agregar productos al carrito
    client.post(
        "/api/v1/carrito/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"producto_id": test_products[0].id, "cantidad": 1},
    )

    # Finalizar compra
    response = client.post(
        "/api/v1/carrito/finalizar",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "direccion": "Av. Siempre Viva 742",
            "tarjeta": "Visa terminada en 1234",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert "compra_id" in data
    assert "message" in data
    assert "finalizada" in data["message"].lower()


def test_checkout_empty_cart(client: TestClient, auth_token: str):
    """Test: Intentar finalizar compra con carrito vacío debe fallar."""
    response = client.post(
        "/api/v1/carrito/finalizar",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "direccion": "Av. Siempre Viva 742",
            "tarjeta": "Visa terminada en 1234",
        },
    )
    assert response.status_code == 400
    assert "vacío" in response.json()["detail"].lower()


def test_checkout_missing_fields(
    client: TestClient, auth_token: str, test_products: list[Product]
):
    """Test: Intentar finalizar compra sin datos completos debe fallar."""
    # Agregar producto
    client.post(
        "/api/v1/carrito/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"producto_id": test_products[0].id, "cantidad": 1},
    )

    # Intentar finalizar sin dirección
    response = client.post(
        "/api/v1/carrito/finalizar",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"tarjeta": "Visa terminada en 1234"},
    )
    assert response.status_code == 422  # Validation error


def test_cart_cleared_after_checkout(
    client: TestClient, auth_token: str, test_products: list[Product]
):
    """Test: El carrito debe vaciarse después de finalizar la compra."""
    # Agregar productos
    client.post(
        "/api/v1/carrito/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"producto_id": test_products[0].id, "cantidad": 1},
    )

    # Finalizar compra
    client.post(
        "/api/v1/carrito/finalizar",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "direccion": "Av. Siempre Viva 742",
            "tarjeta": "Visa terminada en 1234",
        },
    )

    # Verificar que el carrito está vacío
    response = client.get(
        "/api/v1/carrito",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    assert len(response.json()["items"]) == 0


def test_checkout_calculates_totals(
    client: TestClient, auth_token: str, test_products: list[Product]
):
    """Test: El checkout debe calcular correctamente subtotal, IVA y envío."""
    # Agregar productos
    client.post(
        "/api/v1/carrito/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"producto_id": test_products[1].id, "cantidad": 2},  # Mouse $25.50 x 2
    )

    # Obtener totales antes de finalizar
    totals_response = client.get(
        "/api/v1/carrito/totales",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    totals = totals_response.json()

    # Finalizar compra
    checkout_response = client.post(
        "/api/v1/carrito/finalizar",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "direccion": "Av. Siempre Viva 742",
            "tarjeta": "Visa terminada en 1234",
        },
    )

    assert checkout_response.status_code == 200
    # El total debe ser subtotal + IVA + envío
    assert totals["total"] > totals["subtotal"]
    assert totals["envio"] == 50.0  # Envío fijo para compras < $1000


def test_checkout_without_authentication(client: TestClient):
    """Test: Intentar finalizar compra sin autenticación debe fallar."""
    response = client.post(
        "/api/v1/carrito/finalizar",
        json={
            "direccion": "Av. Siempre Viva 742",
            "tarjeta": "Visa terminada en 1234",
        },
    )
    assert response.status_code == 401

