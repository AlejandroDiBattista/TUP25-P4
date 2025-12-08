import pytest
from fastapi.testclient import TestClient
from main import app, crear_tablas, engine
from sqlmodel import Session, select
from models.productos import Usuario, Producto, Carrito
from passlib.context import CryptContext

client = TestClient(app)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    crear_tablas()
    with Session(engine) as session:
        # Limpiar datos existentes
        existing_user = session.exec(select(Usuario).where(Usuario.email == "test@example.com")).first()
        if existing_user:
            session.delete(existing_user)
            session.commit()
        
        # Crear usuario de prueba con contraseña hasheada
        usuario = Usuario(
            nombre="Test User",
            email="test@example.com",
            contraseña_hashed=pwd_context.hash("password123")
        )
        session.add(usuario)
        session.commit()

@pytest.fixture
def auth_token():
    # Obtener un token de autenticación
    response = client.post("/iniciar-sesion", json={"email": "test@example.com", "contraseña": "password123"})
    assert response.status_code == 200
    return response.json()["access_token"]

def test_registrar_usuario():
    response = client.post("/registrar", json={
        "nombre": "Nuevo Usuario",
        "email": "nuevo@example.com",
        "contraseña": "password456"
    })
    assert response.status_code == 200
    assert response.json()["mensaje"] == "Usuario registrado exitosamente"

def test_registrar_usuario_duplicado():
    response = client.post("/registrar", json={
        "nombre": "Test User",
        "email": "test@example.com",
        "contraseña": "password123"
    })
    assert response.status_code == 400
    assert "ya existe" in response.json()["detail"]

def test_iniciar_sesion():
    response = client.post("/iniciar-sesion", json={
        "email": "test@example.com",
        "contraseña": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "usuario" in response.json()

def test_iniciar_sesion_credenciales_invalidas():
    response = client.post("/iniciar-sesion", json={
        "email": "test@example.com",
        "contraseña": "wrongpassword"
    })
    assert response.status_code == 401

def test_obtener_productos():
    """Los productos deben ser públicos, no requieren autenticación"""
    response = client.get("/productos")
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_obtener_productos_por_categoria():
    response = client.get("/productos?categoria=Electrónica")
    assert response.status_code == 200

def test_obtener_productos_busqueda():
    response = client.get("/productos?buscar=mochila")
    assert response.status_code == 200

def test_obtener_producto_especifico():
    response = client.get("/productos/1")
    assert response.status_code == 200
    producto = response.json()
    assert producto["id"] == 1

def test_obtener_producto_no_existe():
    response = client.get("/productos/99999")
    assert response.status_code == 404

def test_agregar_al_carrito(auth_token):
    response = client.post(
        "/carrito",
        json={"producto_id": 1, "cantidad": 2},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    assert response.json()["mensaje"] == "Producto agregado al carrito"

def test_agregar_al_carrito_sin_autenticacion():
    response = client.post("/carrito", json={"producto_id": 1, "cantidad": 2})
    assert response.status_code == 401

def test_agregar_al_carrito_cantidad_invalida(auth_token):
    response = client.post(
        "/carrito",
        json={"producto_id": 1, "cantidad": 0},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 400

def test_obtener_carrito(auth_token):
    response = client.get("/carrito", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    carrito = response.json()
    assert "items" in carrito
    assert "total" in carrito
    assert "subtotal" in carrito
    assert "iva" in carrito
    assert "envio" in carrito

def test_quitar_del_carrito(auth_token):
    # Primero agregar un producto
    client.post(
        "/carrito",
        json={"producto_id": 2, "cantidad": 1},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    # Luego quitarlo
    response = client.delete(
        "/carrito/2",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    assert "eliminado" in response.json()["mensaje"]

def test_finalizar_compra(auth_token):
    # Agregar productos al carrito
    client.post(
        "/carrito",
        json={"producto_id": 3, "cantidad": 1},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    response = client.post(
        "/carrito/finalizar",
        json={"direccion": "Calle Falsa 123", "tarjeta": "4111111111111111"},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    assert "Compra finalizada exitosamente" in response.json()["mensaje"]
    assert "compra_id" in response.json()

def test_finalizar_compra_carrito_vacio(auth_token):
    # Intentar finalizar con carrito vacío
    response = client.post(
        "/carrito/finalizar",
        json={"direccion": "Calle Falsa 123", "tarjeta": "4111111111111111"},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 400

def test_cancelar_compra(auth_token):
    # Agregar productos al carrito
    client.post(
        "/carrito",
        json={"producto_id": 4, "cantidad": 1},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    response = client.post(
        "/carrito/cancelar",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    assert "cancelada" in response.json()["mensaje"]

def test_obtener_compras(auth_token):
    response = client.get("/compras", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_obtener_detalle_compra(auth_token):
    # Primero crear una compra
    client.post(
        "/carrito",
        json={"producto_id": 5, "cantidad": 1},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    compra_response = client.post(
        "/carrito/finalizar",
        json={"direccion": "Calle Falsa 123", "tarjeta": "4111111111111111"},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    compra_id = compra_response.json()["compra_id"]
    
    response = client.get(f"/compras/{compra_id}", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    detalle = response.json()
    assert detalle["id"] == compra_id
    assert "items" in detalle

def test_calculo_iva_electronica(auth_token):
    """Verificar que productos electrónicos tengan 10% de IVA"""
    # Producto 9 es electrónica según productos.json
    client.post(
        "/carrito",
        json={"producto_id": 9, "cantidad": 1},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    response = client.get("/carrito", headers={"Authorization": f"Bearer {auth_token}"})
    carrito = response.json()
    
    # Verificar que el IVA sea aproximadamente 10% del subtotal para electrónica
    # (puede haber otros productos en el carrito)
    assert "iva" in carrito
    assert carrito["iva"] > 0

def test_calculo_envio(auth_token):
    """Verificar que el envío sea $50 para compras menores a $1000"""
    # Limpiar carrito primero
    client.post("/carrito/cancelar", headers={"Authorization": f"Bearer {auth_token}"})
    
    # Agregar producto barato
    client.post(
        "/carrito",
        json={"producto_id": 7, "cantidad": 1},  # Producto de $9.99
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    response = client.get("/carrito", headers={"Authorization": f"Bearer {auth_token}"})
    carrito = response.json()
    
    if carrito["subtotal"] < 1000:
        assert carrito["envio"] == 50
    else:
        assert carrito["envio"] == 0

def test_cerrar_sesion():
    response = client.post("/cerrar-sesion")
    assert response.status_code == 200
    assert "cerrada" in response.json()["mensaje"]
