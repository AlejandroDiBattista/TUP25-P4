import pytest
import uuid
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_registrar_usuario():
    email = f"testuser_{uuid.uuid4().hex}@example.com"
    response = client.post("/registrar", json={
        "nombre": "Test User",
        "email": email,
        "password": "testpass"
    })
    assert response.status_code == 200
    assert "id" in response.json()

def test_login_usuario():
    client.post("/registrar", json={
        "nombre": "Login User",
        "email": "loginuser@example.com",
        "password": "loginpass"
    })
    response = client.post("/iniciar-sesion", json={
        "email": "loginuser@example.com",
        "password": "loginpass"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_get_productos():
    response = client.get("/productos")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_agregar_y_quitar_producto_carrito():

    email = f"carritouser_{uuid.uuid4().hex}@example.com"
    client.post("/registrar", json={
        "nombre": "Carrito User",
        "email": email,
        "password": "carritopass"
    })
    login = client.post("/iniciar-sesion", json={
        "email": email,
        "password": "carritopass"
    })
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    productos = client.get("/productos").json()
    producto_id = productos[0]["id"]
    
    response = client.post(f"/carrito?token={token}&producto_id={producto_id}&cantidad=1", headers=headers)
    assert response.status_code == 200
    
    response = client.delete(f"/carrito/{producto_id}?token={token}", headers=headers)
    assert response.status_code == 200

def test_finalizar_compra():
    client.post("/registrar", json={
        "nombre": "Compra User",
        "email": "comprauser@example.com",
        "password": "comprapass"
    })
    login = client.post("/iniciar-sesion", json={
        "email": "comprauser@example.com",
        "password": "comprapass"
    })
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    productos = client.get("/productos").json()
    producto_id = productos[0]["id"]
    client.post(f"/carrito?token={token}&producto_id={producto_id}&cantidad=1", headers=headers)
    response = client.post(f"/carrito/finalizar?token={token}&direccion=Calle+Falsa+123&tarjeta=1234-5678-9012-3456", headers=headers)
    assert response.status_code == 200
    assert "compra_id" in response.json()

def test_cancelar_compra():
    client.post("/registrar", json={
        "nombre": "Cancelar User",
        "email": "cancelaruser@example.com",
        "password": "cancelarpass"
    })
    login = client.post("/iniciar-sesion", json={
        "email": "cancelaruser@example.com",
        "password": "cancelarpass"
    })
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    productos = client.get("/productos").json()
    producto_id = productos[0]["id"]
    client.post(f"/carrito?token={token}&producto_id={producto_id}&cantidad=1", headers=headers)
    response = client.post(f"/carrito/cancelar?token={token}", headers=headers)
    assert response.status_code == 200
    assert response.json()["ok"] is True

def test_ver_compras():
    client.post("/registrar", json={
        "nombre": "Historial User",
        "email": "historialuser@example.com",
        "password": "historialpass"
    })
    login = client.post("/iniciar-sesion", json={
        "email": "historialuser@example.com",
        "password": "historialpass"
    })
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get(f"/compras?token={token}", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
