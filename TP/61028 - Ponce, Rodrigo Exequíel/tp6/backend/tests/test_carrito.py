import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from models import Usuario, Producto, Carrito, ItemCarrito
from main import app
from models.database import get_session
from auth.security import get_password_hash, crear_token_acceso

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

@pytest.fixture
def client():
    crear_bd_prueba()
    client = TestClient(app)
    yield client
    SQLModel.metadata.drop_all(engine)

@pytest.fixture
def session():
    with Session(engine) as session:
        yield session

@pytest.fixture
def usuario_prueba(session):
    usuario = Usuario(
        nombre="Test User",
        email="test@example.com",
        password_hash=get_password_hash("password123")
    )
    session.add(usuario)
    session.commit()
    session.refresh(usuario)
    return usuario

@pytest.fixture
def token_usuario(usuario_prueba):
    return crear_token_acceso({"sub": usuario_prueba.email})

@pytest.fixture
def headers_auth(token_usuario):
    return {"Authorization": f"Bearer {token_usuario}"}

@pytest.fixture
def producto_prueba(session):
    producto = Producto(
        nombre="Test Product",
        descripcion="Test Description",
        precio=100.0,
        categoria="Test Category",
        existencia=10
    )
    session.add(producto)
    session.commit()
    session.refresh(producto)
    return producto

def test_agregar_al_carrito(client, headers_auth, producto_prueba):
    response = client.post(
        "/carrito/productos",
        headers=headers_auth,
        json={"producto_id": producto_prueba.id, "cantidad": 2}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["producto_id"] == producto_prueba.id
    assert data["cantidad"] == 2

def test_obtener_carrito(client, headers_auth, producto_prueba):
    # Primero agregamos un producto
    client.post(
        "/carrito/productos",
        headers=headers_auth,
        json={"producto_id": producto_prueba.id, "cantidad": 2}
    )
    
    # Luego obtenemos el carrito
    response = client.get("/carrito", headers=headers_auth)
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["producto_id"] == producto_prueba.id

def test_quitar_del_carrito(client, headers_auth, producto_prueba):
    # Primero agregamos un producto
    client.post(
        "/carrito/productos",
        headers=headers_auth,
        json={"producto_id": producto_prueba.id, "cantidad": 2}
    )
    
    # Luego lo quitamos
    response = client.delete(
        f"/carrito/productos/{producto_prueba.id}",
        headers=headers_auth
    )
    assert response.status_code == 200
    
    # Verificamos que el carrito está vacío
    response = client.get("/carrito", headers=headers_auth)
    data = response.json()
    assert len(data["items"]) == 0

def test_actualizar_cantidad_carrito(client, headers_auth, producto_prueba):
    # Primero agregamos un producto
    client.post(
        "/carrito/productos",
        headers=headers_auth,
        json={"producto_id": producto_prueba.id, "cantidad": 2}
    )
    
    # Actualizamos la cantidad
    response = client.put(
        f"/carrito/productos/{producto_prueba.id}",
        headers=headers_auth,
        json={"cantidad": 3}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["cantidad"] == 3

def test_cancelar_carrito(client, headers_auth, producto_prueba):
    # Primero agregamos un producto
    client.post(
        "/carrito/productos",
        headers=headers_auth,
        json={"producto_id": producto_prueba.id, "cantidad": 2}
    )
    
    # Cancelamos el carrito
    response = client.post("/carrito/cancelar", headers=headers_auth)
    assert response.status_code == 200
    
    # Verificamos que el carrito está vacío
    response = client.get("/carrito", headers=headers_auth)
    data = response.json()
    assert len(data["items"]) == 0