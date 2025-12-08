"""
Pruebas unitarias para la API del TP6
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
import tempfile
import os

from main import app
from database import get_session

# Base de datos temporal para pruebas
@pytest.fixture(name="session")
def session_fixture():
    # Crear base de datos temporal en memoria
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session
    
    app.dependency_overrides[get_session] = get_session_override
    
    client = TestClient(app)
    yield client
    
    app.dependency_overrides.clear()

# Test del endpoint raíz
def test_root_endpoint(client: TestClient):
    """Test del endpoint raíz"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "estado" in data

# Test de obtener productos
def test_obtener_productos(client: TestClient):
    """Test para obtener la lista de productos"""
    response = client.get("/productos")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

# Test de obtener categorías
def test_obtener_categorias(client: TestClient):
    """Test para obtener las categorías"""
    response = client.get("/categorias")
    assert response.status_code == 200
    data = response.json()
    assert "categorias" in data
    assert isinstance(data["categorias"], list)

# Test de registrar usuario
def test_registrar_usuario(client: TestClient):
    """Test para registrar un nuevo usuario"""
    usuario_data = {
        "nombre": "Usuario Test",
        "email": "test@example.com",
        "contraseña": "password123"
    }
    
    response = client.post("/registrar", json=usuario_data)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == usuario_data["email"]
    assert data["nombre"] == usuario_data["nombre"]
    assert "id" in data

# Test de registrar usuario con email duplicado
def test_registrar_usuario_email_duplicado(client: TestClient):
    """Test para verificar error con email duplicado"""
    usuario_data = {
        "nombre": "Usuario Test",
        "email": "duplicate@example.com",
        "contraseña": "password123"
    }
    
    # Registrar primera vez
    response1 = client.post("/registrar", json=usuario_data)
    assert response1.status_code == 201
    
    # Intentar registrar de nuevo con mismo email
    response2 = client.post("/registrar", json=usuario_data)
    assert response2.status_code == 400  # Bad Request

# Test de iniciar sesión
def test_iniciar_sesion_exitoso(client: TestClient):
    """Test para iniciar sesión con credenciales válidas"""
    # Primero registrar usuario
    usuario_data = {
        "nombre": "Usuario Login",
        "email": "login@example.com",
        "contraseña": "password123"
    }
    
    register_response = client.post("/registrar", json=usuario_data)
    assert register_response.status_code == 201
    
    # Ahora iniciar sesión
    login_data = {
        "email": "login@example.com",
        "contraseña": "password123"
    }
    
    response = client.post("/iniciar-sesion", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

# Test de iniciar sesión con credenciales incorrectas
def test_iniciar_sesion_credenciales_incorrectas(client: TestClient):
    """Test para verificar error con credenciales incorrectas"""
    login_data = {
        "email": "noexiste@example.com",
        "contraseña": "wrongpassword"
    }
    
    response = client.post("/iniciar-sesion", json=login_data)
    assert response.status_code == 401

# Fixture para obtener token de autenticación
@pytest.fixture(name="auth_token")
def auth_token_fixture(client: TestClient):
    # Registrar usuario de prueba
    usuario_data = {
        "nombre": "Usuario Auth",
        "email": "auth@example.com",
        "contraseña": "password123"
    }
    
    register_response = client.post("/registrar", json=usuario_data)
    assert register_response.status_code == 201
    
    # Obtener token
    login_data = {
        "email": "auth@example.com",
        "contraseña": "password123"
    }
    
    login_response = client.post("/iniciar-sesion", json=login_data)
    assert login_response.status_code == 200
    
    return login_response.json()["access_token"]

# Test de obtener carrito (requiere autenticación)
def test_obtener_carrito(client: TestClient, auth_token: str):
    """Test para obtener el carrito del usuario autenticado"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get("/carrito", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "items" in data
    assert "estado" in data

# Test de obtener carrito sin autenticación
def test_obtener_carrito_sin_auth(client: TestClient):
    """Test para verificar que se requiere autenticación para el carrito"""
    response = client.get("/carrito")
    assert response.status_code == 403

# Test de agregar producto al carrito
def test_agregar_producto_carrito(client: TestClient, auth_token: str):
    """Test para agregar un producto al carrito"""
    # Primero obtener un producto disponible
    productos_response = client.get("/productos")
    productos = productos_response.json()
    
    if productos:
        producto = productos[0]
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        item_data = {
            "producto_id": producto["id"],
            "cantidad": 1
        }
        
        response = client.post("/carrito", json=item_data, headers=headers)
        assert response.status_code == 201

# Test de cancelar carrito
def test_cancelar_carrito(client: TestClient, auth_token: str):
    """Test para cancelar/vaciar el carrito"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.post("/carrito/cancelar", headers=headers)
    assert response.status_code == 200

# Test de obtener compras
def test_obtener_compras(client: TestClient, auth_token: str):
    """Test para obtener el historial de compras"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get("/compras", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "compras" in data
    assert isinstance(data["compras"], list)

# Test de obtener perfil de usuario
def test_obtener_perfil(client: TestClient, auth_token: str):
    """Test para obtener el perfil del usuario autenticado"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get("/perfil", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "email" in data
    assert "nombre" in data

# Test de cerrar sesión
def test_cerrar_sesion(client: TestClient, auth_token: str):
    """Test para cerrar sesión"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.post("/cerrar-sesion", headers=headers)
    assert response.status_code == 200

if __name__ == "__main__":
    pytest.main([__file__])