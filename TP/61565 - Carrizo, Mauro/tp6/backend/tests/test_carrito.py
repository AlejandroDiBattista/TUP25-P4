import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from main import app
from database import engine, init_db
from models import Producto, Usuario
from auth import get_password_hash

client = TestClient(app)

@pytest.fixture(scope="function")
def setup_test_data():
    """Configurar datos de prueba"""
    init_db()
    with Session(engine) as session:
        # Crear usuario de prueba
        usuario = Usuario(
            nombre="Test User",
            email="test@example.com",
            contraseña=get_password_hash("password123")
        )
        session.add(usuario)
        
        # Crear productos de prueba
        producto1 = Producto(
            nombre="Producto 1",
            descripcion="Descripción 1",
            precio=100.0,
            categoria="Test",
            existencia=10
        )
        producto2 = Producto(
            nombre="Producto 2",
            descripcion="Descripción 2",
            precio=50.0,
            categoria="Test",
            existencia=5
        )
        session.add(producto1)
        session.add(producto2)
        session.commit()
        
        # Obtener token
        login_response = client.post(
            "/api/iniciar-sesion",
            json={"email": "test@example.com", "contraseña": "password123"}
        )
        token = login_response.json()["access_token"]
        
        yield {
            "token": token,
            "usuario_id": usuario.id,
            "producto1_id": producto1.id,
            "producto2_id": producto2.id
        }
    
    # Limpiar después del test
    from sqlmodel import SQLModel
    SQLModel.metadata.drop_all(engine)

def test_agregar_producto_carrito(setup_test_data):
    """Test de agregar producto al carrito"""
    token = setup_test_data["token"]
    producto_id = setup_test_data["producto1_id"]
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(
        "/api/carrito",
        json={"producto_id": producto_id, "cantidad": 2},
        headers=headers
    )
    assert response.status_code == 200
    carrito = response.json()
    assert len(carrito["items"]) > 0

def test_ver_carrito(setup_test_data):
    """Test de ver carrito"""
    token = setup_test_data["token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/api/carrito", headers=headers)
    assert response.status_code == 200
    carrito = response.json()
    assert "items" in carrito

def test_quitar_producto_carrito(setup_test_data):
    """Test de quitar producto del carrito"""
    token = setup_test_data["token"]
    producto_id = setup_test_data["producto1_id"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Agregar producto primero
    client.post(
        "/api/carrito",
        json={"producto_id": producto_id, "cantidad": 1},
        headers=headers
    )
    
    # Quitar producto
    response = client.delete(
        f"/api/carrito/{producto_id}",
        headers=headers
    )
    assert response.status_code == 200

def test_agregar_producto_sin_existencia(setup_test_data):
    """Test de agregar producto sin existencia suficiente"""
    token = setup_test_data["token"]
    producto_id = setup_test_data["producto1_id"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.post(
        "/api/carrito",
        json={"producto_id": producto_id, "cantidad": 1000},  # Más de la existencia
        headers=headers
    )
    assert response.status_code == 400

