"""
Tests completos para todos los endpoints del backend.
Utiliza pytest y httpx TestClient para probar la API.
"""

import pytest
from httpx import AsyncClient
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel, select
from sqlmodel.pool import StaticPool

from main import app, obtener_session
from models.productos import Usuario, Producto, Carrito, ItemCarrito, Compra, ItemCompra


# ==================== FIXTURES ====================

@pytest.fixture(name="session")
def session_fixture():
    """Crea una base de datos en memoria para cada test."""
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
    """Crea un cliente de prueba que usa la sesión en memoria."""
    def get_session_override():
        return session

    app.dependency_overrides[obtener_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="productos_base")
def productos_base_fixture(session: Session):
    """Carga productos de prueba en la base de datos."""
    productos = [
        Producto(
            titulo="Camiseta de algodón",
            precio=109.95,
            descripcion="Camiseta cómoda",
            categoria="Ropa de hombre",
            valoracion=4.5,
            existencia=10,
            imagen="https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg"
        ),
        Producto(
            titulo="Auriculares inalámbricos",
            precio=64.00,
            descripcion="Auriculares de alta calidad",
            categoria="Electrónica",
            valoracion=4.8,
            existencia=5,
            imagen="https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg"
        ),
        Producto(
            titulo="Producto agotado",
            precio=50.00,
            descripcion="Sin stock",
            categoria="Ropa de mujer",
            valoracion=3.0,
            existencia=0,
            imagen="https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg"
        ),
    ]
    for producto in productos:
        session.add(producto)
    session.commit()
    for producto in productos:
        session.refresh(producto)
    return productos


# ==================== HELPER FUNCTIONS ====================

def crear_usuario_test(client: TestClient, email="test@example.com", password="password123"):
    """Crea un usuario de prueba y retorna su token."""
    response = client.post(
        "/registrar",
        json={
            "nombre": "Test User",
            "email": email,
            "contraseña": password
        }
    )
    assert response.status_code == 201
    return response.json()["access_token"]


def obtener_headers_auth(token: str):
    """Retorna headers con el token de autenticación."""
    return {"Authorization": f"Bearer {token}"}


# ==================== TESTS DE AUTENTICACIÓN ====================

def test_registrar_usuario(client: TestClient):
    """Test: Registrar un nuevo usuario."""
    response = client.post(
        "/registrar",
        json={
            "nombre": "Juan Pérez",
            "email": "juan@example.com",
            "contraseña": "securepass123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_registrar_email_duplicado(client: TestClient):
    """Test: No permitir emails duplicados."""
    email = "duplicate@example.com"
    # Primer registro
    client.post(
        "/registrar",
        json={"nombre": "User 1", "email": email, "contraseña": "pass123"}
    )
    # Segundo registro con mismo email
    response = client.post(
        "/registrar",
        json={"nombre": "User 2", "email": email, "contraseña": "pass456"}
    )
    assert response.status_code == 400
    assert "ya está registrado" in response.json()["detail"]


def test_iniciar_sesion_exitoso(client: TestClient):
    """Test: Iniciar sesión con credenciales correctas."""
    # Crear usuario primero
    email = "login@example.com"
    password = "mypassword"
    client.post(
        "/registrar",
        json={"nombre": "Login User", "email": email, "contraseña": password}
    )
    
    # Intentar login
    response = client.post(
        "/iniciar-sesion",
        json={"email": email, "contraseña": password}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_iniciar_sesion_credenciales_invalidas(client: TestClient):
    """Test: Rechazar credenciales incorrectas."""
    response = client.post(
        "/iniciar-sesion",
        json={"email": "noexiste@example.com", "contraseña": "wrongpass"}
    )
    assert response.status_code == 401
    assert "incorrectos" in response.json()["detail"]


def test_cerrar_sesion_requiere_auth(client: TestClient):
    """Test: Cerrar sesión requiere autenticación."""
    response = client.post("/cerrar-sesion")
    assert response.status_code == 403


def test_cerrar_sesion_exitoso(client: TestClient):
    """Test: Cerrar sesión exitosamente."""
    token = crear_usuario_test(client)
    response = client.post(
        "/cerrar-sesion",
        headers=obtener_headers_auth(token)
    )
    assert response.status_code == 200
    assert "Sesión cerrada" in response.json()["mensaje"]


# ==================== TESTS DE PRODUCTOS ====================

def test_obtener_productos(client: TestClient, productos_base):
    """Test: Obtener lista de productos."""
    response = client.get("/productos")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert data[0]["titulo"] == "Camiseta de algodón"


def test_filtrar_productos_por_categoria(client: TestClient, productos_base):
    """Test: Filtrar productos por categoría."""
    response = client.get("/productos?categoria=Electrónica")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["titulo"] == "Auriculares inalámbricos"


def test_buscar_productos_por_texto(client: TestClient, productos_base):
    """Test: Buscar productos por texto."""
    response = client.get("/productos?buscar=camiseta")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "Camiseta" in data[0]["titulo"]


def test_obtener_producto_por_id(client: TestClient, productos_base):
    """Test: Obtener un producto específico por ID."""
    response = client.get("/productos/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["titulo"] == "Camiseta de algodón"


def test_obtener_producto_no_existente(client: TestClient):
    """Test: Error al buscar producto que no existe."""
    response = client.get("/productos/99999")
    assert response.status_code == 404
    assert "no encontrado" in response.json()["detail"]


# ==================== TESTS DE CARRITO ====================

def test_agregar_al_carrito_requiere_auth(client: TestClient, productos_base):
    """Test: Agregar al carrito requiere autenticación."""
    response = client.post(
        "/carrito",
        json={"producto_id": 1, "cantidad": 1}
    )
    assert response.status_code == 403


def test_agregar_producto_al_carrito(client: TestClient, productos_base):
    """Test: Agregar producto al carrito exitosamente."""
    token = crear_usuario_test(client)
    response = client.post(
        "/carrito",
        headers=obtener_headers_auth(token),
        json={"producto_id": 1, "cantidad": 2}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["mensaje"] == "Producto agregado al carrito"


def test_agregar_producto_agotado(client: TestClient, productos_base):
    """Test: No permitir agregar productos agotados."""
    token = crear_usuario_test(client)
    response = client.post(
        "/carrito",
        headers=obtener_headers_auth(token),
        json={"producto_id": 3, "cantidad": 1}  # Producto agotado
    )
    assert response.status_code == 400
    assert "Stock insuficiente" in response.json()["detail"]


def test_agregar_cantidad_excede_stock(client: TestClient, productos_base):
    """Test: No permitir cantidad mayor al stock disponible."""
    token = crear_usuario_test(client)
    response = client.post(
        "/carrito",
        headers=obtener_headers_auth(token),
        json={"producto_id": 2, "cantidad": 100}  # Solo hay 5 disponibles
    )
    assert response.status_code == 400
    assert "Stock insuficiente" in response.json()["detail"]


def test_ver_carrito_vacio(client: TestClient):
    """Test: Ver carrito vacío."""
    token = crear_usuario_test(client)
    response = client.get(
        "/carrito",
        headers=obtener_headers_auth(token)
    )
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["cantidad_items"] == 0


def test_ver_carrito_con_productos(client: TestClient, productos_base):
    """Test: Ver carrito con productos."""
    token = crear_usuario_test(client)
    # Agregar productos
    client.post(
        "/carrito",
        headers=obtener_headers_auth(token),
        json={"producto_id": 1, "cantidad": 2}
    )
    client.post(
        "/carrito",
        headers=obtener_headers_auth(token),
        json={"producto_id": 2, "cantidad": 1}
    )
    
    # Ver carrito
    response = client.get(
        "/carrito",
        headers=obtener_headers_auth(token)
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 2
    assert data["cantidad_items"] == 2
    assert data["total"] > 0


def test_eliminar_producto_carrito(client: TestClient, productos_base):
    """Test: Eliminar producto del carrito."""
    token = crear_usuario_test(client)
    # Agregar producto
    client.post(
        "/carrito",
        headers=obtener_headers_auth(token),
        json={"producto_id": 1, "cantidad": 2}
    )
    
    # Eliminar producto
    response = client.delete(
        "/carrito/1",
        headers=obtener_headers_auth(token)
    )
    assert response.status_code == 200
    assert "eliminado" in response.json()["mensaje"]


def test_cancelar_carrito(client: TestClient, productos_base):
    """Test: Cancelar carrito completo."""
    token = crear_usuario_test(client)
    # Agregar productos
    client.post(
        "/carrito",
        headers=obtener_headers_auth(token),
        json={"producto_id": 1, "cantidad": 2}
    )
    
    # Cancelar carrito
    response = client.post(
        "/carrito/cancelar",
        headers=obtener_headers_auth(token)
    )
    assert response.status_code == 200
    assert "cancelado" in response.json()["mensaje"]
    
    # Verificar que el carrito esté vacío
    carrito_response = client.get(
        "/carrito",
        headers=obtener_headers_auth(token)
    )
    assert carrito_response.json()["items"] == []


# ==================== TESTS DE COMPRA ====================

def test_finalizar_compra_carrito_vacio(client: TestClient):
    """Test: No permitir finalizar compra con carrito vacío."""
    token = crear_usuario_test(client)
    response = client.post(
        "/carrito/finalizar",
        headers=obtener_headers_auth(token),
        json={
            "direccion": "Calle Falsa 123 45",
            "tarjeta": "1234"
        }
    )
    assert response.status_code == 404  # Carrito no existe o no tiene items
    assert "carrito" in response.json()["detail"].lower()


def test_finalizar_compra_exitosa(client: TestClient, productos_base):
    """Test: Finalizar compra exitosamente."""
    token = crear_usuario_test(client)
    # Agregar productos al carrito
    client.post(
        "/carrito",
        headers=obtener_headers_auth(token),
        json={"producto_id": 1, "cantidad": 2}
    )
    
    # Finalizar compra
    response = client.post(
        "/carrito/finalizar",
        headers=obtener_headers_auth(token),
        json={
            "direccion": "Av. Siempreviva 742 Ciudad",
            "tarjeta": "9012"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "compra_id" in data
    assert data["total"] > 0
    assert "exitosamente" in data["mensaje"]


def test_calculo_iva_electronica(client: TestClient, productos_base):
    """Test: Verificar cálculo de IVA para electrónica (10%)."""
    token = crear_usuario_test(client)
    # Producto de electrónica cuesta $64.00
    client.post(
        "/carrito",
        headers=obtener_headers_auth(token),
        json={"producto_id": 2, "cantidad": 1}
    )
    
    response = client.post(
        "/carrito/finalizar",
        headers=obtener_headers_auth(token),
        json={
            "direccion": "Test Address 123 City",
            "tarjeta": "4444"
        }
    )
    assert response.status_code == 201
    data = response.json()
    # Subtotal: $64.00, IVA 10%: $6.40, Envío: $50.00 (subtotal < $1000)
    assert data["subtotal"] == 64.00
    assert data["iva"] == 6.40
    assert data["envio"] == 50.00
    assert data["total"] == 120.40


def test_calculo_envio_gratis(client: TestClient, productos_base):
    """Test: Envío gratis si subtotal > $1000."""
    token = crear_usuario_test(client)
    # Agregar muchos productos para superar $1000
    client.post(
        "/carrito",
        headers=obtener_headers_auth(token),
        json={"producto_id": 1, "cantidad": 10}  # 10 x $109.95 = $1099.50
    )
    
    response = client.post(
        "/carrito/finalizar",
        headers=obtener_headers_auth(token),
        json={
            "direccion": "Test Address 456 City",
            "tarjeta": "3333"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["subtotal"] == 1099.50
    assert data["envio"] == 0.00  # Envío gratis


def test_compra_reduce_stock(client: TestClient, productos_base, session: Session):
    """Test: Verificar que la compra reduce el stock."""
    token = crear_usuario_test(client)
    # Stock inicial del producto 2: 5 unidades
    producto_antes = session.get(Producto, 2)
    stock_antes = producto_antes.existencia
    
    # Comprar 3 unidades
    client.post(
        "/carrito",
        headers=obtener_headers_auth(token),
        json={"producto_id": 2, "cantidad": 3}
    )
    client.post(
        "/carrito/finalizar",
        headers=obtener_headers_auth(token),
        json={
            "direccion": "Test Address 789 City",
            "tarjeta": "2222"
        }
    )
    
    # Verificar stock (refrescar desde la sesión de la app, no la de test)
    producto_actualizado = session.exec(
        select(Producto).where(Producto.id == 2)
    ).first()
    assert producto_actualizado.existencia == stock_antes - 3


# ==================== TESTS DE HISTORIAL ====================

def test_ver_historial_vacio(client: TestClient):
    """Test: Ver historial vacío."""
    token = crear_usuario_test(client)
    response = client.get(
        "/compras",
        headers=obtener_headers_auth(token)
    )
    assert response.status_code == 200
    data = response.json()
    assert data["compras"] == []
    assert "No tienes compras" in data["mensaje"]


def test_ver_historial_con_compras(client: TestClient, productos_base):
    """Test: Ver historial con compras."""
    token = crear_usuario_test(client)
    # Realizar una compra
    client.post(
        "/carrito",
        headers=obtener_headers_auth(token),
        json={"producto_id": 1, "cantidad": 2}
    )
    compra_response = client.post(
        "/carrito/finalizar",
        headers=obtener_headers_auth(token),
        json={
            "direccion": "Test Address 111 City",
            "tarjeta": "3456"
        }
    )
    compra_id = compra_response.json()["compra_id"]
    
    # Ver historial
    response = client.get(
        "/compras",
        headers=obtener_headers_auth(token)
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_compras"] == 1
    assert len(data["compras"]) == 1
    assert data["compras"][0]["id"] == compra_id


def test_ver_detalle_compra(client: TestClient, productos_base):
    """Test: Ver detalle de una compra específica."""
    token = crear_usuario_test(client)
    # Realizar compra
    client.post(
        "/carrito",
        headers=obtener_headers_auth(token),
        json={"producto_id": 1, "cantidad": 2}
    )
    compra_response = client.post(
        "/carrito/finalizar",
        headers=obtener_headers_auth(token),
        json={
            "direccion": "Calle Test 123 Ciudad",
            "tarjeta": "7890"
        }
    )
    compra_id = compra_response.json()["compra_id"]
    
    # Ver detalle
    response = client.get(
        f"/compras/{compra_id}",
        headers=obtener_headers_auth(token)
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == compra_id
    assert data["direccion"] == "Calle Test 123 Ciudad"
    assert "****7890" in data["tarjeta"]  # Últimos 4 dígitos
    assert len(data["items"]) == 1


def test_detalle_compra_no_existente(client: TestClient):
    """Test: Error al ver detalle de compra no existente."""
    token = crear_usuario_test(client)
    response = client.get(
        "/compras/99999",
        headers=obtener_headers_auth(token)
    )
    assert response.status_code == 404
    assert "no encontrada" in response.json()["detail"]


def test_detalle_compra_otro_usuario(client: TestClient, productos_base):
    """Test: No permitir ver compras de otros usuarios."""
    # Usuario 1 hace una compra
    token1 = crear_usuario_test(client, email="user1@test.com")
    client.post(
        "/carrito",
        headers=obtener_headers_auth(token1),
        json={"producto_id": 1, "cantidad": 1}
    )
    compra_response = client.post(
        "/carrito/finalizar",
        headers=obtener_headers_auth(token1),
        json={
            "direccion": "Address 1 City Test",
            "tarjeta": "1111"
        }
    )
    compra_id = compra_response.json()["compra_id"]
    
    # Usuario 2 intenta ver la compra del usuario 1
    token2 = crear_usuario_test(client, email="user2@test.com")
    response = client.get(
        f"/compras/{compra_id}",
        headers=obtener_headers_auth(token2)
    )
    assert response.status_code == 403
    assert "permiso" in response.json()["detail"]


# ==================== TESTS DE CASOS DE ERROR ====================

def test_endpoint_sin_autenticacion(client: TestClient):
    """Test: Endpoints protegidos requieren autenticación."""
    endpoints = [
        ("GET", "/carrito"),
        ("POST", "/carrito"),
        ("DELETE", "/carrito/1"),
        ("POST", "/carrito/cancelar"),
        ("POST", "/carrito/finalizar"),
        ("GET", "/compras"),
        ("GET", "/compras/1"),
        ("POST", "/cerrar-sesion"),
    ]
    
    for metodo, endpoint in endpoints:
        if metodo == "GET":
            response = client.get(endpoint)
        elif metodo == "POST":
            response = client.post(endpoint, json={})
        elif metodo == "DELETE":
            response = client.delete(endpoint)
        
        assert response.status_code == 403, f"Endpoint {metodo} {endpoint} debería requerir auth"


def test_producto_no_existente_carrito(client: TestClient):
    """Test: Error al agregar producto no existente al carrito."""
    token = crear_usuario_test(client)
    response = client.post(
        "/carrito",
        headers=obtener_headers_auth(token),
        json={"producto_id": 99999, "cantidad": 1}
    )
    assert response.status_code == 404
    assert "no encontrado" in response.json()["detail"]


def test_cantidad_negativa_carrito(client: TestClient, productos_base):
    """Test: No permitir cantidades negativas o cero."""
    token = crear_usuario_test(client)
    response = client.post(
        "/carrito",
        headers=obtener_headers_auth(token),
        json={"producto_id": 1, "cantidad": 0}
    )
    assert response.status_code == 422  # Validation error
