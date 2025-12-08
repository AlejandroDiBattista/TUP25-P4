"""
Script de prueba para verificar los endpoints de autenticación.
Ejecutar con: uv run python test_auth.py
"""
import httpx
import json
import sys

BASE_URL = "http://localhost:8000"


def verificar_servidor():
    """Verifica si el servidor está corriendo."""
    try:
        response = httpx.get(f"{BASE_URL}/", timeout=5.0)
        if response.status_code == 200:
            print("✅ Servidor corriendo correctamente")
            return True
    except httpx.ConnectError:
        print("❌ ERROR: El servidor no está corriendo en http://localhost:8000")
        print("   Por favor, inicia el servidor con: uv run uvicorn main:app --reload")
        return False
    except Exception as e:
        print(f"❌ ERROR inesperado: {e}")
        return False


def test_registro():
    """Prueba el endpoint de registro."""
    print("\n🧪 Test 1: Probando registro de usuario...")
    
    data = {
        "nombre": "Usuario de Prueba",
        "email": "prueba@example.com",
        "contraseña": "password123"
    }
    
    try:
        response = httpx.post(f"{BASE_URL}/registrar", json=data, timeout=10.0)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            print(f"   ✅ Registro exitoso!")
            print(f"   Usuario: {result['usuario']['nombre']}")
            print(f"   Email: {result['usuario']['email']}")
            print(f"   Token generado: {result['access_token'][:50]}...")
            return result
        else:
            print(f"   ❌ Error en registro")
            print(f"   Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
        return None


def test_login(email, password):
    """Prueba el endpoint de login."""
    print("\n🧪 Test 2: Probando inicio de sesión...")
    
    data = {
        "email": email,
        "contraseña": password
    }
    
    try:
        response = httpx.post(f"{BASE_URL}/iniciar-sesion", json=data, timeout=10.0)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Login exitoso!")
            print(f"   Usuario: {result['usuario']['nombre']}")
            print(f"   Token generado: {result['access_token'][:50]}...")
            return result
        else:
            print(f"   ❌ Error en login")
            print(f"   Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
        return None


def test_cerrar_sesion(token):
    """Prueba el endpoint de cerrar sesión."""
    print("\n🧪 Test 3: Probando cerrar sesión...")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = httpx.post(f"{BASE_URL}/cerrar-sesion", headers=headers, timeout=10.0)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Cierre de sesión exitoso!")
            print(f"   Mensaje: {result['mensaje']}")
            return True
        else:
            print(f"   ❌ Error al cerrar sesión")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
        return False


if __name__ == "__main__":
    print("=" * 70)
    print("PRUEBAS DE AUTENTICACIÓN - API E-COMMERCE")
    print("=" * 70)
    
    # Verificar que el servidor esté corriendo
    if not verificar_servidor():
        sys.exit(1)
    
    # Test 1: Registro
    registro_result = test_registro()
    
    if registro_result:
        token = registro_result["access_token"]
        email = registro_result["usuario"]["email"]
        
        # Test 2: Login
        login_result = test_login(email, "password123")
        
        if login_result:
            new_token = login_result["access_token"]
            
            # Test 3: Cerrar sesión
            test_cerrar_sesion(new_token)
    
    print("\n" + "=" * 70)
    print("PRUEBAS COMPLETADAS")
    print("=" * 70)
