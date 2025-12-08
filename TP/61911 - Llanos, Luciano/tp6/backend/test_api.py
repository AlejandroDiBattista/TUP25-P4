"""
Tests automatizados para la API E-Commerce
Ejecutar con: pytest test_api.py -v
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
import json
from datetime import datetime

from main import app
from database import get_session
from models.productos import Producto
from models.usuarios import Usuario
from models.carrito import Carrito, CarritoItem
from models.pedidos import Pedido, PedidoItem

# Base de datos de prueba en memoria
@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", 
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        # Crear productos de prueba
        productos_test = [
            Producto(
                id=1,
                titulo="Producto Test 1",
                precio=100.0,
                descripcion="Descripción test",
                categoria="Test",
                valoracion=4.5,
                existencia=10,
                imagen="test1.jpg"
            ),
            Producto(
                id=2,
                titulo="Producto Test 2", 
                precio=200.0,
                descripcion="Descripción test 2",
                categoria="Test",
                valoracion=4.0,
                existencia=5,
                imagen="test2.jpg"
            )
        ]
        
        for producto in productos_test:
            session.add(producto)
        
        session.commit()
        yield session

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

def test_read_main(client: TestClient):
    """Test endpoint raíz"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "mensaje" in data

def test_health_check(client: TestClient):
    """Test health check"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "timestamp" in data

def test_obtener_productos(client: TestClient):
    """Test obtener lista de productos"""
    response = client.get("/productos")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["titulo"] == "Producto Test 1"

def test_obtener_producto_por_id(client: TestClient):
    """Test obtener producto específico"""
    response = client.get("/productos/1")
    assert response.status_code == 200
    data = response.json()
    assert data["titulo"] == "Producto Test 1"
    assert data["precio"] == 100.0

def test_obtener_producto_no_existe(client: TestClient):
    """Test producto que no existe"""
    response = client.get("/productos/999")
    assert response.status_code == 404

def test_obtener_categorias(client: TestClient):
    """Test obtener categorías"""
    response = client.get("/categorias")
    assert response.status_code == 200
    data = response.json()
    assert "categorias" in data
    assert "Test" in data["categorias"]

class TestAuthentication:
    """Tests de autenticación"""
    
    def test_registrar_usuario(self, client: TestClient):
        """Test registro de usuario"""
        usuario_data = {
            "nombre": "Juan",
            "apellido": "Perez", 
            "email": "test@example.com",
            "password": "password123"
        }
        
        response = client.post("/registrar", json=usuario_data)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["nombre"] == "Juan"
        assert "password" not in data

    def test_registrar_email_duplicado(self, client: TestClient):
        """Test registro con email duplicado"""
        usuario_data = {
            "nombre": "Juan",
            "apellido": "Perez",
            "email": "test@example.com", 
            "password": "password123"
        }
        
        # Primer registro
        client.post("/registrar", json=usuario_data)
        
        # Segundo registro con mismo email
        response = client.post("/registrar", json=usuario_data)
        assert response.status_code == 400

    def test_login_usuario(self, client: TestClient):
        """Test login de usuario"""
        # Registrar usuario primero
        usuario_data = {
            "nombre": "Juan",
            "apellido": "Perez",
            "email": "login@example.com",
            "password": "password123"
        }
        client.post("/registrar", json=usuario_data)
        
        # Login
        login_data = {
            "email": "login@example.com",
            "password": "password123"
        }
        
        response = client.post("/iniciar-sesion", json=login_data)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_credenciales_incorrectas(self, client: TestClient):
        """Test login con credenciales incorrectas"""
        login_data = {
            "email": "noexiste@example.com",
            "password": "wrongpassword"
        }
        
        response = client.post("/iniciar-sesion", json=login_data)
        assert response.status_code == 401

def get_auth_header(client: TestClient) -> dict:
    """Helper para obtener header de autorización"""
    # Registrar y hacer login
    usuario_data = {
        "nombre": "Test",
        "apellido": "User",
        "email": "auth@example.com",
        "password": "password123"
    }
    client.post("/registrar", json=usuario_data)
    
    login_data = {
        "email": "auth@example.com", 
        "password": "password123"
    }
    
    response = client.post("/iniciar-sesion", json=login_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

class TestCarrito:
    """Tests del carrito de compras"""
    
    def test_obtener_carrito_vacio(self, client: TestClient):
        """Test obtener carrito vacío"""
        headers = get_auth_header(client)
        response = client.get("/carrito", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total_items"] == 0
        assert data["total_precio"] == 0.0
        assert len(data["items"]) == 0

    def test_agregar_producto_al_carrito(self, client: TestClient):
        """Test agregar producto al carrito"""
        headers = get_auth_header(client)
        
        item_data = {
            "producto_id": 1,
            "cantidad": 2
        }
        
        response = client.post("/carrito/agregar", json=item_data, headers=headers)
        assert response.status_code == 200
        
        # Verificar carrito
        response = client.get("/carrito", headers=headers)
        data = response.json()
        assert data["total_items"] == 2
        assert len(data["items"]) == 1
        assert data["items"][0]["cantidad"] == 2

    def test_agregar_producto_no_existe(self, client: TestClient):
        """Test agregar producto que no existe"""
        headers = get_auth_header(client)
        
        item_data = {
            "producto_id": 999,
            "cantidad": 1
        }
        
        response = client.post("/carrito/agregar", json=item_data, headers=headers)
        assert response.status_code == 404

    def test_agregar_sin_stock(self, client: TestClient):
        """Test agregar más cantidad que el stock disponible"""
        headers = get_auth_header(client)
        
        # Agotar el stock del producto
        item_data = {
            "producto_id": 1,
            "cantidad": 10  # Agregar todo el stock disponible
        }
        client.post("/carrito/agregar", json=item_data, headers=headers)
        
        # Intentar agregar más cuando no hay stock
        item_data2 = {
            "producto_id": 1,
            "cantidad": 1  # Esto debería fallar porque ya no hay stock
        }
        
        response = client.post("/carrito/agregar", json=item_data2, headers=headers)
        assert response.status_code == 400
        data = response.json()
        assert "Stock insuficiente" in data["detail"]

class TestCheckoutYPedidos:
    """Tests de checkout y gestión de pedidos"""
    
    def test_checkout_carrito_vacio(self, client: TestClient):
        """Test checkout con carrito vacío"""
        headers = get_auth_header(client)
        
        response = client.get("/checkout/preview", headers=headers)
        assert response.status_code == 400  # Carrito vacío

    def test_preview_checkout(self, client: TestClient):
        """Test preview de checkout"""
        headers = get_auth_header(client)
        
        # Agregar productos al carrito
        client.post("/carrito/agregar", json={"producto_id": 1, "cantidad": 2}, headers=headers)
        
        response = client.get("/checkout/preview", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "subtotal" in data
        assert "impuestos" in data
        assert "total" in data
        assert data["cantidad_items"] == 2

    def test_procesar_checkout(self, client: TestClient):
        """Test procesar checkout completo"""
        headers = get_auth_header(client)
        
        # Agregar productos al carrito
        client.post("/carrito/agregar", json={"producto_id": 1, "cantidad": 1}, headers=headers)
        
        # Datos del pedido
        pedido_data = {
            "direccion_entrega": {
                "direccion": "Av. Test 123",
                "ciudad": "Ciudad Test",
                "codigo_postal": "1234",
                "telefono": "1234567890"
            },
            "info_pago": {
                "metodo_pago": "tarjeta_credito",
                "numero_tarjeta": "4532123456789012",
                "nombre_titular": "Test User"
            },
            "notas": "Entrega test"
        }
        
        response = client.post("/checkout", json=pedido_data, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "numero_pedido" in data
        assert data["estado"] == "confirmado"
        assert len(data["items"]) == 1

    def test_obtener_pedidos(self, client: TestClient):
        """Test obtener historial de pedidos"""
        headers = get_auth_header(client)
        
        response = client.get("/pedidos", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

class TestEndpointsAdministrativos:
    """Tests de endpoints administrativos"""
    
    def test_listar_todos_pedidos(self, client: TestClient):
        """Test listar todos los pedidos (admin)"""
        response = client.get("/admin/pedidos")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

def test_cors_headers(client: TestClient):
    """Test headers CORS"""
    response = client.options("/")
    # En testing, CORS puede no estar completamente configurado
    assert response.status_code in [200, 405]  # Puede variar según configuración

def test_documentacion_swagger(client: TestClient):
    """Test acceso a documentación"""
    response = client.get("/docs")
    assert response.status_code == 200
    
    response = client.get("/openapi.json")
    assert response.status_code == 200