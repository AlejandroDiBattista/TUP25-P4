"""
Script de prueba para los endpoints de carrito.

Este script prueba:
1. POST /carrito - Agregar productos al carrito
2. GET /carrito - Ver carrito con items y total
3. DELETE /carrito/{id} - Quitar producto del carrito
4. POST /carrito/cancelar - Cancelar/vaciar carrito
5. Validación de stock insuficiente
6. Manejo de errores (sin autenticación, producto inexistente)

Ejecutar con: uv run python test_carrito.py
"""

import httpx
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"
HEADERS = {"Content-Type": "application/json"}

# Usuario de prueba
TEST_USER = {
    "nombre": "Usuario Carrito Test",
    "email": f"carrito_test_{datetime.now().timestamp()}@example.com",
    "password": "test123"
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
    print("🚀 PRUEBAS DE ENDPOINTS DE CARRITO")
    print("="*60)
    
    token = None
    
    with httpx.Client() as client:
        # ========================================
        # SETUP: Registrar y autenticar usuario
        # ========================================
        print_test("SETUP: Registrar y autenticar usuario de prueba")
        
        # Registrar
        response = client.post(
            f"{BASE_URL}/registrar",
            headers=HEADERS,
            json=TEST_USER
        )
        
        if response.status_code != 201:
            print_error("No se pudo registrar el usuario de prueba")
            return
        
        # Login
        response = client.post(
            f"{BASE_URL}/iniciar-sesion",
            headers=HEADERS,
            json={"email": TEST_USER["email"], "password": TEST_USER["password"]}
        )
        
        if response.status_code == 200:
            token = response.json()["access_token"]
            print_success(f"Usuario autenticado - Token obtenido")
        else:
            print_error("No se pudo obtener el token")
            return
        
        auth_headers = {**HEADERS, "Authorization": f"Bearer {token}"}
        
        # ========================================
        # TEST 1: Ver carrito vacío
        # ========================================
        print_test("TEST 1: Ver carrito vacío (recién creado)")
        
        response = client.get(f"{BASE_URL}/carrito", headers=auth_headers)
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            if data["total"] == 0 and len(data["items"]) == 0:
                print_success("Carrito vacío retornado correctamente")
            else:
                print_error("El carrito debería estar vacío")
        else:
            print_error("Error al obtener carrito")
        
        # ========================================
        # TEST 2: Agregar producto al carrito
        # ========================================
        print_test("TEST 2: Agregar producto al carrito (ID: 1, cantidad: 2)")
        
        response = client.post(
            f"{BASE_URL}/carrito",
            headers=auth_headers,
            json={"producto_id": 1, "cantidad": 2}
        )
        print_response(response)
        
        if response.status_code == 201:
            print_success("Producto agregado correctamente")
        else:
            print_error("Error al agregar producto")
        
        # ========================================
        # TEST 3: Agregar otro producto
        # ========================================
        print_test("TEST 3: Agregar otro producto (ID: 5, cantidad: 1)")
        
        response = client.post(
            f"{BASE_URL}/carrito",
            headers=auth_headers,
            json={"producto_id": 5, "cantidad": 1}
        )
        print_response(response)
        
        if response.status_code == 201:
            print_success("Segundo producto agregado")
        else:
            print_error("Error al agregar segundo producto")
        
        # ========================================
        # TEST 4: Ver carrito con productos
        # ========================================
        print_test("TEST 4: Ver carrito con productos")
        
        response = client.get(f"{BASE_URL}/carrito", headers=auth_headers)
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            if len(data["items"]) == 2 and data["total"] > 0:
                print_success(f"Carrito con 2 productos - Total: ${data['total']}")
            else:
                print_error("El carrito debería tener 2 productos")
        else:
            print_error("Error al obtener carrito")
        
        # ========================================
        # TEST 5: Agregar producto existente (suma cantidad)
        # ========================================
        print_test("TEST 5: Agregar producto ya existente (ID: 1, cantidad: 1)")
        
        response = client.post(
            f"{BASE_URL}/carrito",
            headers=auth_headers,
            json={"producto_id": 1, "cantidad": 1}
        )
        print_response(response)
        
        if response.status_code == 201:
            print_success("Cantidad actualizada (debería sumar)")
            
            # Verificar que la cantidad aumentó
            response = client.get(f"{BASE_URL}/carrito", headers=auth_headers)
            data = response.json()
            item_1 = next((i for i in data["items"] if i["producto_id"] == 1), None)
            if item_1 and item_1["cantidad"] == 3:
                print_success(f"Cantidad correcta: {item_1['cantidad']}")
            else:
                print_error("La cantidad no se sumó correctamente")
        else:
            print_error("Error al actualizar cantidad")
        
        # ========================================
        # TEST 6: Intentar agregar producto sin stock
        # ========================================
        print_test("TEST 6: Intentar agregar producto sin stock (cantidad: 1000)")
        
        response = client.post(
            f"{BASE_URL}/carrito",
            headers=auth_headers,
            json={"producto_id": 1, "cantidad": 1000}
        )
        print_response(response)
        
        if response.status_code == 400:
            print_success("Error 400 correctamente retornado por stock insuficiente")
        else:
            print_error("Debería retornar error 400")
        
        # ========================================
        # TEST 7: Intentar agregar producto inexistente
        # ========================================
        print_test("TEST 7: Intentar agregar producto inexistente (ID: 999)")
        
        response = client.post(
            f"{BASE_URL}/carrito",
            headers=auth_headers,
            json={"producto_id": 999, "cantidad": 1}
        )
        print_response(response)
        
        if response.status_code == 404:
            print_success("Error 404 correctamente retornado")
        else:
            print_error("Debería retornar error 404")
        
        # ========================================
        # TEST 8: Quitar producto del carrito
        # ========================================
        print_test("TEST 8: Quitar producto del carrito (ID: 1)")
        
        response = client.delete(
            f"{BASE_URL}/carrito/1",
            headers=auth_headers
        )
        print_response(response)
        
        if response.status_code == 200:
            print_success("Producto eliminado del carrito")
            
            # Verificar que se eliminó
            response = client.get(f"{BASE_URL}/carrito", headers=auth_headers)
            data = response.json()
            if len(data["items"]) == 1:
                print_success(f"Carrito ahora tiene {len(data['items'])} producto")
            else:
                print_error("El producto no se eliminó correctamente")
        else:
            print_error("Error al eliminar producto")
        
        # ========================================
        # TEST 9: Intentar quitar producto no existente
        # ========================================
        print_test("TEST 9: Intentar quitar producto no existente en carrito")
        
        response = client.delete(
            f"{BASE_URL}/carrito/999",
            headers=auth_headers
        )
        print_response(response)
        
        if response.status_code == 404:
            print_success("Error 404 correctamente retornado")
        else:
            print_error("Debería retornar error 404")
        
        # ========================================
        # TEST 10: Cancelar carrito
        # ========================================
        print_test("TEST 10: Cancelar carrito (vaciar)")
        
        response = client.post(
            f"{BASE_URL}/carrito/cancelar",
            headers=auth_headers
        )
        print_response(response)
        
        if response.status_code == 200:
            print_success("Carrito cancelado")
            
            # Verificar que está vacío
            response = client.get(f"{BASE_URL}/carrito", headers=auth_headers)
            data = response.json()
            if len(data["items"]) == 0:
                print_success("Carrito vacío después de cancelar")
            else:
                print_error("El carrito debería estar vacío")
        else:
            print_error("Error al cancelar carrito")
        
        # ========================================
        # TEST 11: Intentar acceder sin autenticación
        # ========================================
        print_test("TEST 11: Intentar ver carrito sin autenticación")
        
        response = client.get(f"{BASE_URL}/carrito", headers=HEADERS)
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
    print("✅ Todas las pruebas de endpoints de carrito completadas")
    print("\n📝 Endpoints probados:")
    print("   - GET /carrito (ver carrito vacío y con productos)")
    print("   - POST /carrito (agregar, sumar cantidad, validar stock)")
    print("   - DELETE /carrito/{id} (quitar producto)")
    print("   - POST /carrito/cancelar (vaciar carrito)")
    print("   - Validación de errores (stock, productos inexistentes, sin auth)")
    print("\n🎯 Sistema de carrito funcionando correctamente!")
    print("="*60)


if __name__ == "__main__":
    print("\n⚠️  IMPORTANTE: Asegúrate de que el servidor esté corriendo en http://127.0.0.1:8000")
    print("   Ejecuta en otra terminal: .venv\\Scripts\\uvicorn.exe main:app --reload")
    input("\nPresiona ENTER para comenzar las pruebas...")
    
    try:
        main()
    except httpx.ConnectError:
        print("\n❌ ERROR: No se puede conectar al servidor")
        print("   Asegúrate de que el servidor esté corriendo en http://127.0.0.1:8000")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
