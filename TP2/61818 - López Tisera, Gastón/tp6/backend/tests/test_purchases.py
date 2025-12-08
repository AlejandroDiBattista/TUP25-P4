"""
Tests para los endpoints de historial de compras.
"""

import pytest
from fastapi.testclient import TestClient

from app.models.product import Product
from app.models.user import User


def create_purchase(
    client: TestClient, auth_token: str, test_products: list[Product]
) -> int:
    """
    Helper: Crea una compra de prueba y retorna su ID.
    """
    # Agregar productos al carrito
    client.post(
        "/api/v1/carrito/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"producto_id": test_products[0].id, "cantidad": 2},
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
    return response.json()["compra_id"]


def test_list_empty_purchases(client: TestClient, auth_token: str):
    """Test: Listar compras cuando no hay ninguna debe retornar lista vacía."""
    response = client.get(
        "/api/v1/compras",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data == []


def test_list_purchases(
    client: TestClient, auth_token: str, test_products: list[Product]
):
    """Test: Listar compras debe retornar todas las compras del usuario."""
    # Crear dos compras
    create_purchase(client, auth_token, test_products)
    create_purchase(client, auth_token, test_products)

    response = client.get(
        "/api/v1/compras",
        headers={"Authorization": f"Bearer {auth_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert "id" in data[0]
    assert "fecha" in data[0]
    assert "total" in data[0]
    assert "items" in data[0]


def test_get_purchase_detail(
    client: TestClient, auth_token: str, test_products: list[Product]
):
    """Test: Obtener detalle de una compra específica."""
    purchase_id = create_purchase(client, auth_token, test_products)

    response = client.get(
        f"/api/v1/compras/{purchase_id}",
        headers={"Authorization": f"Bearer {auth_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == purchase_id
    assert "direccion" in data
    assert "tarjeta" in data
    assert "items" in data
    assert len(data["items"]) > 0
    assert data["direccion"] == "Av. Siempre Viva 742"
    assert data["tarjeta"] == "Visa terminada en 1234"


def test_get_nonexistent_purchase(client: TestClient, auth_token: str):
    """Test: Intentar obtener una compra inexistente debe retornar 404."""
    response = client.get(
        "/api/v1/compras/9999",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 404
    assert "no encontrada" in response.json()["detail"].lower()


def test_purchase_has_items(
    client: TestClient, auth_token: str, test_products: list[Product]
):
    """Test: Una compra debe contener los items comprados con sus detalles."""
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

    # Finalizar compra
    response = client.post(
        "/api/v1/carrito/finalizar",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "direccion": "Calle Falsa 123",
            "tarjeta": "MasterCard 5678",
        },
    )
    purchase_id = response.json()["compra_id"]

    # Obtener detalle
    detail_response = client.get(
        f"/api/v1/compras/{purchase_id}",
        headers={"Authorization": f"Bearer {auth_token}"},
    )

    data = detail_response.json()
    assert len(data["items"]) == 2
    # Verificar que cada item tiene los campos necesarios
    for item in data["items"]:
        assert "nombre" in item
        assert "cantidad" in item
        assert "precio_unitario" in item
        assert "producto_id" in item


def test_purchase_stores_totals(
    client: TestClient, auth_token: str, test_products: list[Product]
):
    """Test: Una compra debe almacenar el total y el costo de envío."""
    purchase_id = create_purchase(client, auth_token, test_products)

    response = client.get(
        f"/api/v1/compras/{purchase_id}",
        headers={"Authorization": f"Bearer {auth_token}"},
    )

    data = response.json()
    assert "total" in data
    assert "envio" in data
    assert data["total"] > 0
    assert data["envio"] >= 0


def test_purchases_without_authentication(client: TestClient):
    """Test: Intentar acceder al historial sin autenticación debe fallar."""
    response = client.get("/api/v1/compras")
    assert response.status_code == 401


def test_user_only_sees_own_purchases(
    client: TestClient, session, test_products: list[Product]
):
    """Test: Un usuario solo debe ver sus propias compras."""
    from app.core.security import get_password_hash
    from app.models.user import User

    # Crear dos usuarios
    user1 = User(
        nombre="User 1",
        email="user1@example.com",
        hashed_password=get_password_hash("password123"),
    )
    user2 = User(
        nombre="User 2",
        email="user2@example.com",
        hashed_password=get_password_hash("password123"),
    )
    session.add(user1)
    session.add(user2)
    session.commit()

    # Login user1
    login1 = client.post(
        "/api/v1/auth/iniciar-sesion",
        json={"email": "user1@example.com", "password": "password123"},
    )
    token1 = login1.json()["access_token"]

    # Login user2
    login2 = client.post(
        "/api/v1/auth/iniciar-sesion",
        json={"email": "user2@example.com", "password": "password123"},
    )
    token2 = login2.json()["access_token"]

    # User1 crea una compra
    create_purchase(client, token1, test_products)

    # User2 lista sus compras (debe estar vacío)
    response = client.get(
        "/api/v1/compras",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert response.status_code == 200
    assert len(response.json()) == 0

    # User1 lista sus compras (debe tener 1)
    response = client.get(
        "/api/v1/compras",
        headers={"Authorization": f"Bearer {token1}"},
    )
    assert response.status_code == 200
    assert len(response.json()) == 1

