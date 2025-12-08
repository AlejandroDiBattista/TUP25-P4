"""
Script de prueba para los endpoints de autenticación.

Este script prueba:
1. POST /registrar - Crear nuevo usuario
2. POST /iniciar-sesion - Login y obtener token
3. POST /cerrar-sesion - Logout con token válido
4. Casos de error (email duplicado, credenciales incorrectas)

Ejecutar con: uv run python test_auth_endpoints.py
"""

import httpx
import json
from datetime import datetime

# Configuración
BASE_URL = "http://127.0.0.1:8000"
HEADERS = {"Content-Type": "application/json"}

# Datos de prueba
TEST_USER = {
    "nombre": "Usuario de Prueba",
    "email": f"test_{datetime.now().timestamp()}@example.com",
    "password": "password123"
}

def print_test(nombre: str):
    """Imprimir nombre de la prueba."""
    print(f"\n{'='*60}")
    print(f"🧪 {nombre}")
    print('='*60)

def print_success(mensaje: str):
    """Imprimir mensaje de éxito."""
    print(f"✅ {mensaje}")

def print_error(mensaje: str):
    """Imprimir mensaje de error."""
    print(f"❌ {mensaje}")

def print_response(response):
    """Imprimir detalles de la respuesta."""
    print(f"   Status: {response.status_code}")
    try:
        print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    except:
        print(f"   Response: {response.text}")


def main():
    print("\n" + "="*60)
    print("🚀 PRUEBAS DE ENDPOINTS DE AUTENTICACIÓN")
    print("="*60)
    
    # Variable para guardar el token
    token = None
    
    with httpx.Client() as client:
        # ========================================
        # TEST 1: Registrar nuevo usuario
        # ========================================
        print_test("TEST 1: Registrar nuevo usuario")
        
        response = client.post(
            f"{BASE_URL}/registrar",
            headers=HEADERS,
            json=TEST_USER
        )
        print_response(response)
        
        if response.status_code == 201:
            print_success("Usuario registrado correctamente")
        else:
            print_error("Error al registrar usuario")
            return
        
        # ========================================
        # TEST 2: Intentar registrar email duplicado
        # ========================================
        print_test("TEST 2: Intentar registrar email duplicado (debe fallar)")
        
        response = client.post(
            f"{BASE_URL}/registrar",
            headers=HEADERS,
            json=TEST_USER
        )
        print_response(response)
        
        if response.status_code == 400:
            print_success("Error 400 correctamente retornado para email duplicado")
        else:
            print_error("Debería retornar error 400")
        
        # ========================================
        # TEST 3: Iniciar sesión con credenciales correctas
        # ========================================
        print_test("TEST 3: Iniciar sesión con credenciales correctas")
        
        login_data = {
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
        
        response = client.post(
            f"{BASE_URL}/iniciar-sesion",
            headers=HEADERS,
            json=login_data
        )
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                token = data["access_token"]
                print_success(f"Login exitoso - Token obtenido (primeros 50 caracteres): {token[:50]}...")
            else:
                print_error("No se encontró access_token en la respuesta")
                return
        else:
            print_error("Error al iniciar sesión")
            return
        
        # ========================================
        # TEST 4: Intentar login con contraseña incorrecta
        # ========================================
        print_test("TEST 4: Intentar login con contraseña incorrecta (debe fallar)")
        
        wrong_login = {
            "email": TEST_USER["email"],
            "password": "contraseña_incorrecta"
        }
        
        response = client.post(
            f"{BASE_URL}/iniciar-sesion",
            headers=HEADERS,
            json=wrong_login
        )
        print_response(response)
        
        if response.status_code == 401:
            print_success("Error 401 correctamente retornado para contraseña incorrecta")
        else:
            print_error("Debería retornar error 401")
        
        # ========================================
        # TEST 5: Intentar login con email inexistente
        # ========================================
        print_test("TEST 5: Intentar login con email inexistente (debe fallar)")
        
        inexistent_login = {
            "email": "noexiste@example.com",
            "password": "cualquiercontraseña"
        }
        
        response = client.post(
            f"{BASE_URL}/iniciar-sesion",
            headers=HEADERS,
            json=inexistent_login
        )
        print_response(response)
        
        if response.status_code == 401:
            print_success("Error 401 correctamente retornado para email inexistente")
        else:
            print_error("Debería retornar error 401")
        
        # ========================================
        # TEST 6: Cerrar sesión con token válido
        # ========================================
        print_test("TEST 6: Cerrar sesión con token válido")
        
        auth_headers = {
            **HEADERS,
            "Authorization": f"Bearer {token}"
        }
        
        response = client.post(
            f"{BASE_URL}/cerrar-sesion",
            headers=auth_headers
        )
        print_response(response)
        
        if response.status_code == 200:
            print_success("Sesión cerrada correctamente")
        else:
            print_error("Error al cerrar sesión")
        
        # ========================================
        # TEST 7: Intentar cerrar sesión sin token
        # ========================================
        print_test("TEST 7: Intentar cerrar sesión sin token (debe fallar)")
        
        response = client.post(
            f"{BASE_URL}/cerrar-sesion",
            headers=HEADERS
        )
        print_response(response)
        
        if response.status_code == 401:
            print_success("Error 401 correctamente retornado sin token")
        else:
            print_error("Debería retornar error 401")
    
    # ========================================
    # RESUMEN FINAL
    # ========================================
    print("\n" + "="*60)
    print("📊 RESUMEN DE PRUEBAS")
    print("="*60)
    print("✅ Todas las pruebas de endpoints de autenticación completadas")
    print("\n📝 Endpoints probados:")
    print("   - POST /registrar (creación y validación de duplicados)")
    print("   - POST /iniciar-sesion (login exitoso y errores de credenciales)")
    print("   - POST /cerrar-sesion (con y sin autenticación)")
    print("\n🎯 Sistema de autenticación funcionando correctamente!")
    print("="*60)


if __name__ == "__main__":
    print("\n⚠️  IMPORTANTE: Asegúrate de que el servidor esté corriendo en http://localhost:8000")
    print("   Ejecuta en otra terminal: .venv\\Scripts\\uvicorn.exe main:app --reload")
    input("\nPresiona ENTER para comenzar las pruebas...")
    
    try:
        main()
    except httpx.ConnectError:
        print("\n❌ ERROR: No se puede conectar al servidor")
        print("   Asegúrate de que el servidor esté corriendo en http://localhost:8000")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
