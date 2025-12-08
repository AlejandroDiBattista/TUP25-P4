import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from models.productos import Producto
from main import app
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

@pytest.fixture(name="session")
def session_fixture():
    with Session(engine) as session:
        yield session

def test_obtener_productos_vacio(client):
    response = client.get("/productos")
    assert response.status_code == 200
    assert response.json() == []

def test_obtener_productos_con_filtro(session, client):
    # Crear productos de prueba
    producto1 = Producto(
        nombre="Laptop Gaming",
        descripcion="Laptop para juegos",
        precio=1500.0,
        categoria="Electrónicos",
        existencia=5
    )
    producto2 = Producto(
        nombre="Mouse Gamer",
        descripcion="Mouse RGB",
        precio=50.0,
        categoria="Electrónicos",
        existencia=10
    )
    session.add(producto1)
    session.add(producto2)
    session.commit()

    # Probar búsqueda
    response = client.get("/productos?busqueda=gaming")
    assert response.status_code == 200
    productos = response.json()
    assert len(productos) == 1
    assert productos[0]["nombre"] == "Laptop Gaming"

    # Probar filtro por categoría
    response = client.get("/productos?categoria=Electrónicos")
    assert response.status_code == 200
    productos = response.json()
    assert len(productos) == 2

    # Probar filtro por precio
    response = client.get("/productos?precio_min=100&precio_max=2000")
    assert response.status_code == 200
    productos = response.json()
    assert len(productos) == 1
    assert productos[0]["nombre"] == "Laptop Gaming"

def test_obtener_producto_por_id(session, client):
    producto = Producto(
        nombre="Test Producto",
        descripcion="Descripción de prueba",
        precio=100.0,
        categoria="Test",
        existencia=1
    )
    session.add(producto)
    session.commit()
    session.refresh(producto)

    response = client.get(f"/productos/{producto.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["nombre"] == "Test Producto"

def test_obtener_producto_no_existente(client):
    response = client.get("/productos/999")
    assert response.status_code == 404

def test_obtener_categorias(session, client):
    producto1 = Producto(
        nombre="Producto 1",
        descripcion="Test 1",
        precio=100.0,
        categoria="Categoría A",
        existencia=1
    )
    producto2 = Producto(
        nombre="Producto 2",
        descripcion="Test 2",
        precio=200.0,
        categoria="Categoría B",
        existencia=1
    )
    session.add(producto1)
    session.add(producto2)
    session.commit()

    response = client.get("/categorias")
    assert response.status_code == 200
    categorias = response.json()
    assert len(categorias) == 2
    assert "Categoría A" in categorias
    assert "Categoría B" in categorias