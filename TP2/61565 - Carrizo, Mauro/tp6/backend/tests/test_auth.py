import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from main import app
from database import engine, init_db
from models import Usuario
from auth import get_password_hash

client = TestClient(app)

@pytest.fixture(scope="function")
def db_session():
    """Crear sesión de base de datos para tests"""
    init_db()
    with Session(engine) as session:
        yield session
    # Limpiar después del test
    from sqlmodel import SQLModel
    SQLModel.metadata.drop_all(engine)

def test_registrar_usuario():
    """Test de registro de usuario"""
    response = client.post(
        "/api/registrar",
        json={
            "nombre": "Test User",
            "email": "test@example.com",
            "contraseña": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_registrar_usuario_duplicado():
    """Test de registro con email duplicado"""
    # Registrar primer usuario
    client.post(
        "/api/registrar",
        json={
            "nombre": "Test User",
            "email": "test@example.com",
            "contraseña": "password123"
        }
    )
    
    # Intentar registrar otro con el mismo email
    response = client.post(
        "/api/registrar",
        json={
            "nombre": "Another User",
            "email": "test@example.com",
            "contraseña": "password456"
        }
    )
    assert response.status_code == 400
    assert "ya está registrado" in response.json()["detail"]

def test_iniciar_sesion():
    """Test de inicio de sesión"""
    # Registrar usuario primero
    client.post(
        "/api/registrar",
        json={
            "nombre": "Test User",
            "email": "test@example.com",
            "contraseña": "password123"
        }
    )
    
    # Iniciar sesión
    response = client.post(
        "/api/iniciar-sesion",
        json={
            "email": "test@example.com",
            "contraseña": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

def test_iniciar_sesion_credenciales_incorrectas():
    """Test de inicio de sesión con credenciales incorrectas"""
    response = client.post(
        "/api/iniciar-sesion",
        json={
            "email": "nonexistent@example.com",
            "contraseña": "wrongpassword"
        }
    )
    assert response.status_code == 401

