"""
Tests para los endpoints del carrito de compras.
"""

import pytest
from fastapi.testclient import TestClient

from app.models.product import Product
from app.models.user import User


def test_view_empty_cart(client: TestClient, auth_token: str):
    """Test: Ver carrito vacío debe retornar lista vacía."""
    response = client.get(
        "/api/v1/carrito",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["estado"] == "activo"


def test_add_item_to_cart(
    client: TestClient, auth_token: str, test_products: list[Product]
):
    """Test: Agregar un producto al carrito."""
    product_id = test_products[0].id
    response = client.post(
        "/api/v1/carrito/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"producto_id": product_id, "cantidad": 2},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["producto_id"] == product_id
    assert data["items"][0]["cantidad"] == 2


def test_add_multiple_products_to_cart(
    client: TestClient, auth_token: str, test_products: list[Product]
):
    """Test: Agregar múltiples productos al carrito."""
    # Agregar primer producto
    client.post(
        "/api/v1/carrito/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"producto_id": test_products[0].id, "cantidad": 1},
    )

    # Agregar segundo producto
    response = client.post(
        "/api/v1/carrito/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"producto_id": test_products[1].id, "cantidad": 3},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 2


def test_increase_item_quantity_in_cart(
    client: TestClient, auth_token: str, test_products: list[Product]
):
    """Test: Aumentar la cantidad de un producto ya en el carrito."""
    product_id = test_products[0].id

    # Agregar producto
    client.post(
        "/api/v1/carrito/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"producto_id": product_id, "cantidad": 2},
    )

    # Agregar más unidades del mismo producto
    response = client.post(
        "/api/v1/carrito/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"producto_id": product_id, "cantidad": 3},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["cantidad"] == 5


def test_add_out_of_stock_product(
    client: TestClient, auth_token: str, test_products: list[Product]
):
    """Test: Intentar agregar producto sin stock debe fallar."""
    # test_products[2] tiene existencia = 0
    product_id = test_products[2].id
    response = client.post(
        "/api/v1/carrito/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"producto_id": product_id, "cantidad": 1},
    )
    assert response.status_code == 400
    assert "stock" in response.json()["detail"].lower()


def test_add_more_than_available_stock(
    client: TestClient, auth_token: str, test_products: list[Product]
):
    """Test: Intentar agregar más unidades que el stock disponible debe fallar."""
    # test_products[1] tiene existencia = 5
    product_id = test_products[1].id
    response = client.post(
        "/api/v1/carrito/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"producto_id": product_id, "cantidad": 10},
    )
    assert response.status_code == 400
    assert "stock" in response.json()["detail"].lower()


def test_remove_item_from_cart(
    client: TestClient, auth_token: str, test_products: list[Product]
):
    """Test: Eliminar un producto del carrito."""
    product_id = test_products[0].id

    # Agregar producto
    client.post(
        "/api/v1/carrito/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"producto_id": product_id, "cantidad": 2},
    )

    # Eliminar producto
    response = client.delete(
        f"/api/v1/carrito/{product_id}",
        headers={"Authorization": f"Bearer {auth_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 0


def test_cancel_cart(
    client: TestClient, auth_token: str, test_products: list[Product]
):
    """Test: Cancelar el carrito (vaciar todos los productos)."""
    # Agregar productos
    client.post(
        "/api/v1/carrito/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"producto_id": test_products[0].id, "cantidad": 2},
    )
    client.post(
        "/api/v1/carrito/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"producto_id": test_products[1].id, "cantidad": 1},
    )

    # Cancelar carrito
    response = client.post(
        "/api/v1/carrito/cancelar",
        headers={"Authorization": f"Bearer {auth_token}"},
    )

    assert response.status_code == 200
    assert "cancelado" in response.json()["message"].lower()

    # Verificar que el carrito está vacío
    response = client.get(
        "/api/v1/carrito",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert len(response.json()["items"]) == 0


def test_get_cart_totals(
    client: TestClient, auth_token: str, test_products: list[Product]
):
    """Test: Obtener los totales del carrito (subtotal, IVA, envío, total)."""
    # Agregar productos al carrito
    client.post(
        "/api/v1/carrito/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"producto_id": test_products[0].id, "cantidad": 2},  # Notebook $500 x 2
    )

    response = client.get(
        "/api/v1/carrito/totales",
        headers={"Authorization": f"Bearer {auth_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "subtotal" in data
    assert "iva" in data
    assert "envio" in data
    assert "total" in data
    assert data["subtotal"] == 1000.0
    assert data["envio"] == 0.0  # Envío gratuito para compras > $1000


def test_cart_totals_with_shipping(
    client: TestClient, auth_token: str, test_products: list[Product]
):
    """Test: Totales del carrito con costo de envío."""
    # Agregar producto con precio bajo
    client.post(
        "/api/v1/carrito/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"producto_id": test_products[1].id, "cantidad": 1},  # Mouse $25.50
    )

    response = client.get(
        "/api/v1/carrito/totales",
        headers={"Authorization": f"Bearer {auth_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["envio"] == 50.0  # Costo fijo de envío


def test_cart_without_authentication(client: TestClient):
    """Test: Intentar acceder al carrito sin autenticación debe fallar."""
    response = client.get("/api/v1/carrito")
    assert response.status_code == 401

