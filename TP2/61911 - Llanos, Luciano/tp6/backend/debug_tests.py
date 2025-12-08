"""
Tests de depuración para identificar problemas específicos
"""
import sys
sys.path.append('.')

from fastapi.testclient import TestClient
from main import app
import json

client = TestClient(app)

def get_auth_header():
    """Helper para obtener header de autorización"""
    # Registrar y hacer login
    usuario_data = {
        "nombre": "Debug",
        "apellido": "User",
        "email": "debug@example.com",
        "password": "password123"
    }
    
    client.post("/registrar", json=usuario_data)
    
    login_data = {
        "email": "debug@example.com", 
        "password": "password123"
    }
    
    response = client.post("/iniciar-sesion", json=login_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_stock_debug():
    """Test para verificar el comportamiento del stock"""
    print("=== TEST STOCK DEBUG ===")
    headers = get_auth_header()
    
    # Verificar producto 1
    response = client.get("/productos/1")
    print(f"Producto 1: {response.json()}")
    
    # Intentar agregar 10 unidades
    item_data = {"producto_id": 1, "cantidad": 10}
    response = client.post("/carrito/agregar", json=item_data, headers=headers)
    print(f"Agregar 10 unidades - Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Ver el carrito
    response = client.get("/carrito", headers=headers)
    print(f"Carrito después: {response.json()}")

def test_checkout_debug():
    """Test para verificar el comportamiento del checkout"""
    print("\n=== TEST CHECKOUT DEBUG ===")
    headers = get_auth_header()
    
    # Agregar producto al carrito
    client.post("/carrito/agregar", json={"producto_id": 1, "cantidad": 1}, headers=headers)
    
    # Intentar checkout
    pedido_data = {
        "direccion_entrega": {
            "direccion": "Av. Test 123",
            "ciudad": "Ciudad Test", 
            "codigo_postal": "1234",
            "telefono": "123456789"
        },
        "info_pago": {
            "metodo_pago": "tarjeta_credito",
            "numero_tarjeta": "4532123456789012", 
            "nombre_titular": "Test User"
        },
        "notas": "Entrega test"
    }
    
    response = client.post("/checkout", json=pedido_data, headers=headers)
    print(f"Checkout - Status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test_stock_debug()
    test_checkout_debug()