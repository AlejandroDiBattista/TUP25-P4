import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from main import app
from database import engine, init_db
from models import Producto

client = TestClient(app)

@pytest.fixture(scope="function")
def db_session():
    """Crear sesión de base de datos para tests"""
    init_db()
    with Session(engine) as session:
        # Agregar productos de prueba
        producto1 = Producto(
            nombre="Producto Test 1",
            descripcion="Descripción test",
            precio=100.0,
            categoria="Test",
            existencia=10
        )
        producto2 = Producto(
            nombre="Producto Test 2",
            descripcion="Otra descripción",
            precio=200.0,
            categoria="Electrónicos",
            existencia=5
        )
        session.add(producto1)
        session.add(producto2)
        session.commit()
        yield session
    # Limpiar después del test
    from sqlmodel import SQLModel
    SQLModel.metadata.drop_all(engine)

def test_obtener_productos():
    """Test de obtener lista de productos"""
    response = client.get("/api/productos")
    assert response.status_code == 200
    productos = response.json()
    assert isinstance(productos, list)

def test_obtener_producto_por_id():
    """Test de obtener producto específico"""
    # Primero obtener lista para tener un ID válido
    response = client.get("/api/productos")
    if response.json():
        producto_id = response.json()[0]["id"]
        response = client.get(f"/api/productos/{producto_id}")
        assert response.status_code == 200
        assert "nombre" in response.json()

def test_filtrar_por_categoria():
    """Test de filtro por categoría"""
    response = client.get("/api/productos?categoria=Electrónicos")
    assert response.status_code == 200
    productos = response.json()
    if productos:
        assert all(p["categoria"] == "Electrónicos" for p in productos)

def test_buscar_producto():
    """Test de búsqueda de productos"""
    response = client.get("/api/productos?busqueda=Test")
    assert response.status_code == 200
    productos = response.json()
    # Verificar que los resultados contienen la búsqueda
    if productos:
        assert any("Test" in p["nombre"] or "Test" in p["descripcion"] for p in productos)

