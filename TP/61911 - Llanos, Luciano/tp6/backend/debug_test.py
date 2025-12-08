"""
Debug para probar qué pasa con el endpoint
"""
import requests
import json

# Login
login_data = {
    "email": "auth@example.com", 
    "password": "password123"
}

# Primero registrar usuario
register_data = {
    "nombre": "Test",
    "apellido": "User", 
    "email": "auth@example.com",
    "password": "password123"
}

try:
    response = requests.post("http://localhost:8003/registrar", json=register_data)
    print(f"Registro: {response.status_code}")
    print(f"Registro body: {response.text}")
    
    # Login
    response = requests.post("http://localhost:8003/iniciar-sesion", json=login_data)
    print(f"Login: {response.status_code}")
    if response.status_code == 200:
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Agregar al carrito con stock insuficiente
        item_data = {
            "producto_id": 1,
            "cantidad": 20
        }
        
        response = requests.post("http://localhost:8003/carrito/agregar", json=item_data, headers=headers)
        print(f"Agregar carrito: {response.status_code}")
        print(f"Agregar carrito body: {response.text}")
    else:
        print(f"Login failed: {response.text}")
        
except Exception as e:
    print(f"Error: {e}")