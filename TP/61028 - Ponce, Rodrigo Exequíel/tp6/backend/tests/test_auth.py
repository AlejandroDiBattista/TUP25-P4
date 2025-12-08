import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from main import app
from models.models import Usuario
from models.database import get_session

# Configuración de base de datos de prueba
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

def crear_bd_prueba():
    SQLModel.metadata.create_all(engine)

def get_session_override():
    with Session(engine) as session:
        yield session

app.dependency_overrides[get_session] = get_session_override

@pytest.fixture(name="client")
def client_fixture():
    crear_bd_prueba()
    client = TestClient(app)
    yield client
    SQLModel.metadata.drop_all(engine)

def test_registro_usuario(client):
    response = client.post(
        "/registrar",
        json={
            "nombre": "Usuario Prueba",
            "email": "test@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "password" not in data

def test_login_usuario(client):
    # Primero registramos un usuario
    client.post(
        "/registrar",
        json={
            "nombre": "Usuario Prueba",
            "email": "test@example.com",
            "password": "password123"
        }
    )
    
    # Intentamos hacer login
    response = client.post(
        "/token",
        data={
            "username": "test@example.com",
            "password": "password123"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_obtener_usuario_actual(client):
    # Registrar y hacer login
    client.post(
        "/registrar",
        json={
            "nombre": "Usuario Prueba",
            "email": "test@example.com",
            "password": "password123"
        }
    )
    
    response = client.post(
        "/token",
        data={
            "username": "test@example.com",
            "password": "password123"
        }
    )
    
    token = response.json()["access_token"]
    
    # Obtener usuario actual
    response = client.get(
        "/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"