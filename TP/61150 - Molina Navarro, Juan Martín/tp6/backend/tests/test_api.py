import uuid

import pytest

pytestmark = pytest.mark.asyncio


def generar_email() -> str:
    return f"test_{uuid.uuid4().hex[:8]}@example.com"


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def registrar_usuario(client, *, email: str, password: str) -> None:
    response = await client.post(
        "/registrar",
        json={"nombre": "Test User", "email": email, "password": password},
    )
    assert response.status_code == 201, response.text


async def login(client, *, email: str, password: str) -> str:
    response = await client.post(
        "/iniciar-sesion",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    return data["access_token"]


async def crear_usuario_y_obtener_token(client) -> tuple[str, str]:
    email = generar_email()
    password = "ClaveSegura123"
    await registrar_usuario(client, email=email, password=password)
    token = await login(client, email=email, password=password)
    return token, email


async def primer_producto_id(client) -> int:
    response = await client.get("/productos")
    assert response.status_code == 200, response.text
    productos = response.json()
    assert productos, "La base de datos de pruebas debe tener productos"
    return productos[0]["id"]


async def test_registrar_e_iniciar_sesion(client):
    email = generar_email()
    password = "ClaveSegura123"

    registro = await client.post(
        "/registrar",
        json={"nombre": "Usuario QA", "email": email, "password": password},
    )
    assert registro.status_code == 201
    assert registro.json()["usuario"]["email"] == email

    login_resp = await client.post(
        "/iniciar-sesion",
        json={"email": email, "password": password},
    )
    assert login_resp.status_code == 200
    data = login_resp.json()
    assert "access_token" in data
    assert data["usuario"]["email"] == email


async def test_login_rechaza_credenciales_invalidas(client):
    response = await client.post(
        "/iniciar-sesion",
        json={"email": "inexistente@example.com", "password": "123456"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Credenciales invalidas"


async def test_carrito_agregar_actualizar_y_cancelar(client):
    token, _ = await crear_usuario_y_obtener_token(client)
    producto_id = await primer_producto_id(client)

    agregar = await client.post(
        "/carrito",
        headers=auth_header(token),
        json={"producto_id": producto_id, "cantidad": 1},
    )
    assert agregar.status_code == 201
    assert agregar.json()["items"][0]["cantidad"] == 1

    actualizar = await client.patch(
        f"/carrito/{producto_id}",
        headers=auth_header(token),
        json={"cantidad": 3},
    )
    assert actualizar.status_code == 200
    assert actualizar.json()["items"][0]["cantidad"] == 3

    eliminar = await client.delete(
        f"/carrito/{producto_id}",
        headers=auth_header(token),
    )
    assert eliminar.status_code == 200
    assert eliminar.json()["items"] == []

    # Agregamos nuevamente para validar cancelar
    await client.post(
        "/carrito",
        headers=auth_header(token),
        json={"producto_id": producto_id, "cantidad": 2},
    )
    cancelar = await client.post(
        "/carrito/cancelar",
        headers=auth_header(token),
    )
    assert cancelar.status_code == 200
    assert cancelar.json()["items"] == []


async def test_finalizar_compra_y_historial(client):
    token, _ = await crear_usuario_y_obtener_token(client)
    producto_id = await primer_producto_id(client)

    respuesta_carrito = await client.post(
        "/carrito",
        headers=auth_header(token),
        json={"producto_id": producto_id, "cantidad": 2},
    )
    assert respuesta_carrito.status_code == 201

    checkout = await client.post(
        "/carrito/finalizar",
        headers=auth_header(token),
        json={"direccion": "Av. Siempre Viva 742", "tarjeta": "4111111111111111"},
    )
    assert checkout.status_code == 200
    total = checkout.json()["total"]
    assert total > 0

    compras = await client.get("/compras", headers=auth_header(token))
    assert compras.status_code == 200
    lista = compras.json()["compras"]
    assert len(lista) == 1
    primera = lista[0]
    assert primera["usuario_id"] > 0
    assert primera["total"] == pytest.approx(total)

    detalle = await client.get(f"/compras/{primera['id']}", headers=auth_header(token))
    assert detalle.status_code == 200
    assert detalle.json()["items"]

    carrito = await client.get("/carrito", headers=auth_header(token))
    assert carrito.status_code == 200
    assert carrito.json()["items"] == []


async def test_historial_requiere_autenticacion(client):
    response = await client.get("/compras")
    assert response.status_code == 401
