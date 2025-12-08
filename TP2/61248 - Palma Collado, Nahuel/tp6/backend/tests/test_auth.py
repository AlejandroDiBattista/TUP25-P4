from __future__ import annotations

from fastapi.testclient import TestClient


def test_registro_y_login_exitoso(client: TestClient) -> None:
    registro = client.post(
        "/registrar",
        json={"nombre": "Juana", "email": "juana@example.com", "password": "Secreta123"},
    )
    assert registro.status_code == 201
    data = registro.json()
    assert data["nombre"] == "Juana"
    assert data["email"] == "juana@example.com"

    login = client.post(
        "/iniciar-sesion",
        json={"email": "juana@example.com", "password": "Secreta123"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    assert token

    perfil = client.get("/me", headers={"Authorization": f"Bearer {token}"})
    assert perfil.status_code == 200
    assert perfil.json()["email"] == "juana@example.com"

    cerrar = client.post("/cerrar-sesion", headers={"Authorization": f"Bearer {token}"})
    assert cerrar.status_code == 204

    protegido = client.get("/carrito", headers={"Authorization": f"Bearer {token}"})
    assert protegido.status_code == 401

    # Intento de login con password incorrecta
    login_fail = client.post(
        "/iniciar-sesion",
        json={"email": "juana@example.com", "password": "malPass"},
    )
    assert login_fail.status_code == 401


def test_registro_email_duplicado(client: TestClient) -> None:
    payload = {"nombre": "Ana", "email": "ana@example.com", "password": "ClaveSegura1"}
    primera = client.post("/registrar", json=payload)
    assert primera.status_code == 201

    repetida = client.post("/registrar", json=payload)
    assert repetida.status_code == 400
    assert repetida.json()["detail"] == "El email ya está registrado"
