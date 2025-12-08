"""Test de agregar al carrito con debug detallado"""
import httpx
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"
email = f"test_{int(datetime.now().timestamp())}@test.com"

client = httpx.Client(timeout=10.0)

# 1. Registrar
print("1. Registrando usuario...")
resp = client.post(
    f"{BASE_URL}/registrar",
    json={"nombre": "Test User", "email": email, "password": "test123456"}
)
print(f"   Status: {resp.status_code}")
print(f"   Response: {resp.text}")

# 2. Login
print("\n2. Iniciando sesión...")
resp = client.post(
    f"{BASE_URL}/iniciar-sesion",
    json={"email": email, "password": "test123456"}
)
print(f"   Status: {resp.status_code}")
print(f"   Response: {resp.text}")

if resp.status_code == 200:
    token = resp.json()["access_token"]
    print(f"   Token obtenido: {token[:30]}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Agregar al carrito
    print("\n3. Agregando producto al carrito...")
    resp = client.post(
        f"{BASE_URL}/carrito",
        headers=headers,
        json={"producto_id": 1, "cantidad": 2}
    )
    print(f"   Status: {resp.status_code}")
    print(f"   Response: {resp.text}")
    
    # 4. Ver carrito
    print("\n4. Viendo carrito...")
    resp = client.get(f"{BASE_URL}/carrito", headers=headers)
    print(f"   Status: {resp.status_code}")
    if resp.status_code == 200:
        carrito = resp.json()
        print(f"   Items: {len(carrito['items'])}")
        print(f"   Total: ${carrito['total']:.2f}")
        print(f"   Carrito completo:")
        print(f"   {json.dumps(carrito, indent=2, ensure_ascii=False)}")
else:
    print("ERROR: No se pudo obtener token")
