import requests
import json

# Configuración
BACKEND_URL = "http://127.0.0.1:8000"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "password"

def test_login_and_carrito():
    print("🧪 Iniciando test de login y carrito...")
    
    # Paso 1: Login
    print("\n1️⃣ Testeando login...")
    login_data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/iniciar-sesion", json=login_data)
        print(f"Status login: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token") or data.get("token") or data.get("accessToken")
            if token:
                print(f"✅ Token obtenido: {token[:50]}...")
                
                # Paso 2: Test carrito GET
                print("\n2️⃣ Testeando GET /carrito...")
                headers = {
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
                
                carrito_response = requests.get(f"{BACKEND_URL}/carrito", headers=headers)
                print(f"Status carrito GET: {carrito_response.status_code}")
                print(f"Response: {carrito_response.text}")
                
                # Paso 3: Test agregar al carrito
                print("\n3️⃣ Testeando POST /carrito...")
                carrito_data = {
                    "product_id": 1,  # Asumiendo que existe producto con ID 1
                    "cantidad": 1
                }
                
                add_response = requests.post(f"{BACKEND_URL}/carrito", json=carrito_data, headers=headers)
                print(f"Status carrito POST: {add_response.status_code}")
                print(f"Response: {add_response.text}")
                
                if add_response.status_code == 200:
                    print("✅ Producto agregado al carrito exitosamente!")
                else:
                    print("❌ Error agregando producto al carrito")
                    
            else:
                print("❌ No se encontró token en la respuesta")
        else:
            print("❌ Error en login")
            
    except Exception as e:
        print(f"❌ Error en la prueba: {e}")

def test_productos():
    print("\n📦 Verificando productos disponibles...")
    try:
        response = requests.get(f"{BACKEND_URL}/productos")
        print(f"Status productos: {response.status_code}")
        if response.status_code == 200:
            productos = response.json()
            print(f"Productos encontrados: {len(productos)}")
            for p in productos[:3]:  # Mostrar solo los primeros 3
                print(f"- ID: {p.get('id')}, Nombre: {p.get('nombre', p.get('title', 'Sin nombre'))}")
        else:
            print(f"Error obteniendo productos: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_productos()
    test_login_and_carrito()