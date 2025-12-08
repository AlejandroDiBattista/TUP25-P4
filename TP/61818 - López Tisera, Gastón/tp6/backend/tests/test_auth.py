"""
Tests para los endpoints de autenticación.
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.user import User
from tests.conftest import AUTH_PREFIX


def test_register_user(client: TestClient):
    """Test: Registrar un nuevo usuario correctamente."""
    response = client.post(
        f"{AUTH_PREFIX}/register",
        json={
            "nombre": "Nuevo Usuario",
            "email": "nuevo@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "nuevo@example.com"
    assert data["nombre"] == "Nuevo Usuario"
    assert "id" in data


def test_register_duplicate_email(client: TestClient, test_user: User):
    """Test: Intentar registrar un email duplicado debe fallar."""
    response = client.post(
        f"{AUTH_PREFIX}/register",
        json={
            "nombre": "Otro Usuario",
            "email": test_user.email,
            "password": "password123",
        },
    )
    assert response.status_code == 400
    assert "ya está registrado" in response.json()["detail"]


def test_login_success(client: TestClient, test_user: User):
    """Test: Login exitoso debe retornar un token."""
    response = client.post(
        f"{AUTH_PREFIX}/login",
        json={"email": test_user.email, "password": "testpassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials(client: TestClient, test_user: User):
    """Test: Login con credenciales inválidas debe fallar."""
    response = client.post(
        f"{AUTH_PREFIX}/login",
        json={"email": test_user.email, "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert "Credenciales inválidas" in response.json()["detail"]


def test_login_nonexistent_user(client: TestClient):
    """Test: Login con usuario inexistente debe fallar."""
    response = client.post(
        f"{AUTH_PREFIX}/login",
        json={"email": "noexiste@example.com", "password": "password123"},
    )
    assert response.status_code == 401


def test_get_current_user(client: TestClient, test_user: User, auth_token: str):
    """Test: Obtener información del usuario actual con token válido."""
    response = client.get(
        f"{AUTH_PREFIX}/me",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email
    assert data["nombre"] == test_user.nombre


def test_get_current_user_without_token(client: TestClient):
    """Test: Intentar acceder sin token debe retornar 401."""
    response = client.get(f"{AUTH_PREFIX}/me")
    assert response.status_code == 401


def test_get_current_user_invalid_token(client: TestClient):
    """Test: Token inválido debe retornar 401."""
    response = client.get(
        f"{AUTH_PREFIX}/me",
        headers={"Authorization": "Bearer token_invalido"},
    )
    assert response.status_code == 401

