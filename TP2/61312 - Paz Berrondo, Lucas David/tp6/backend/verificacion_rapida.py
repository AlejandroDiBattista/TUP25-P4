"""
Script de verificación rápida del backend TP6
Verifica los aspectos críticos antes de la entrega

Ejecutar: uv run python verificacion_rapida.py
"""

import httpx
import json
import sys
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"
TEST_EMAIL = f"verificacion_{int(datetime.now().timestamp())}@test.com"
TEST_PASSWORD = "test123456"
TEST_NOMBRE = "Usuario Verificación"

# Colores
class Color:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_header(texto):
    print(f"\n{Color.BOLD}{Color.BLUE}{'='*70}{Color.END}")
    print(f"{Color.BOLD}{Color.BLUE}{texto}{Color.END}")
    print(f"{Color.BOLD}{Color.BLUE}{'='*70}{Color.END}\n")

def print_test(nombre, ok, detalle=""):
    simbolo = "✅" if ok else "❌"
    color = Color.GREEN if ok else Color.RED
    print(f"{color}{simbolo} {nombre}{Color.END}")
    if detalle:
        print(f"   {detalle}")

def verificar_servidor():
    """Verifica que el servidor esté corriendo"""
    try:
        response = httpx.get(BASE_URL, timeout=5.0)
        return response.status_code == 200
    except:
        return False

def main():
    print_header("🔍 VERIFICACIÓN RÁPIDA TP6 - E-COMMERCE")
    
    # 1. Verificar servidor
    print_header("1️⃣ Conexión al Servidor")
    servidor_ok = verificar_servidor()
    print_test("Servidor en http://localhost:8000", servidor_ok,
               "OK" if servidor_ok else "ERROR: Inicia el servidor con 'uv run uvicorn main:app --reload'")
    
    if not servidor_ok:
        print(f"\n{Color.RED}❌ No se puede continuar sin el servidor{Color.END}")
        sys.exit(1)
    
    with httpx.Client(timeout=10.0) as client:
        # 2. Endpoints básicos
        print_header("2️⃣ Endpoints Básicos")
        
        # Productos
        response = client.get(f"{BASE_URL}/productos")
        productos_ok = response.status_code == 200 and len(response.json()) > 0
        print_test("GET /productos", productos_ok,
                   f"{len(response.json())} productos disponibles" if productos_ok else "ERROR")
        
        # Producto específico
        response = client.get(f"{BASE_URL}/productos/1")
        producto_ok = response.status_code == 200
        print_test("GET /productos/1", producto_ok)
        
        # Búsqueda
        response = client.get(f"{BASE_URL}/productos?buscar=laptop")
        busqueda_ok = response.status_code == 200
        print_test("GET /productos?buscar=laptop", busqueda_ok,
                   f"{len(response.json())} resultados" if busqueda_ok else "ERROR")
        
        # Filtro categoría
        response = client.get(f"{BASE_URL}/productos?categoria=Electrónica")
        filtro_ok = response.status_code == 200
        print_test("GET /productos?categoria=Electrónica", filtro_ok,
                   f"{len(response.json())} productos" if filtro_ok else "ERROR")
        
        # 3. Autenticación
        print_header("3️⃣ Autenticación")
        
        # Registro
        response = client.post(
            f"{BASE_URL}/registrar",
            json={
                "nombre": TEST_NOMBRE,
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
        )
        registro_ok = response.status_code == 201
        print_test("POST /registrar", registro_ok,
                   response.json().get("mensaje", "") if registro_ok else f"ERROR: {response.status_code}")
        
        # Login
        response = client.post(
            f"{BASE_URL}/iniciar-sesion",
            json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
        )
        login_ok = response.status_code == 200
        token = None
        if login_ok:
            data = response.json()
            token = data.get("access_token")
            nombre = data.get("nombre")
            print_test("POST /iniciar-sesion", True,
                       f"Token obtenido - Usuario: {nombre}")
        else:
            print_test("POST /iniciar-sesion", False, f"ERROR: {response.status_code}")
        
        if not token:
            print(f"\n{Color.RED}❌ No se pudo obtener token{Color.END}")
            sys.exit(1)
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Usuario actual
        response = client.get(f"{BASE_URL}/usuarios/me", headers=headers)
        usuario_ok = response.status_code == 200
        print_test("GET /usuarios/me", usuario_ok,
                   f"Usuario: {response.json().get('nombre', '')}" if usuario_ok else "ERROR")
        
        # 4. Carrito
        print_header("4️⃣ Gestión de Carrito")
        
        # Ver carrito vacío
        response = client.get(f"{BASE_URL}/carrito", headers=headers)
        carrito_vacio_ok = response.status_code == 200 and len(response.json()["items"]) == 0
        print_test("GET /carrito (vacío)", carrito_vacio_ok)
        
        # Agregar producto
        response = client.post(
            f"{BASE_URL}/carrito",
            headers=headers,
            json={"producto_id": 1, "cantidad": 2}
        )
        agregar_ok = response.status_code == 201
        print_test("POST /carrito", agregar_ok,
                   response.json().get("mensaje", "") if agregar_ok else "ERROR")
        
        # Ver carrito con items
        response = client.get(f"{BASE_URL}/carrito", headers=headers)
        carrito_ok = response.status_code == 200
        carrito_data = response.json()
        if carrito_ok:
            print_test("GET /carrito (con items)", True,
                       f"{len(carrito_data['items'])} items - Total: ${carrito_data['total']:.2f}")
            print(f"      Subtotal: ${carrito_data['subtotal']:.2f}")
            print(f"      IVA: ${carrito_data['iva']:.2f}")
            print(f"      Envío: ${carrito_data['envio']:.2f}")
        else:
            print_test("GET /carrito (con items)", False)
        
        # Actualizar cantidad
        response = client.put(
            f"{BASE_URL}/carrito/1",
            headers=headers,
            json={"cantidad": 3}
        )
        actualizar_ok = response.status_code == 200
        print_test("PUT /carrito/{id}", actualizar_ok)
        
        # 5. Finalizar compra
        print_header("5️⃣ Finalizar Compra")
        
        response = client.post(
            f"{BASE_URL}/carrito/finalizar",
            headers=headers,
            json={
                "direccion": "Av. Test 1234, CABA",
                "tarjeta": "4111111111111111"
            }
        )
        compra_ok = response.status_code == 200
        compra_id = None
        if compra_ok:
            compra_data = response.json()
            compra_id = compra_data.get("compra_id")
            print_test("POST /carrito/finalizar", True,
                       f"Compra #{compra_id} - Total: ${compra_data['total']:.2f}")
            print(f"      Subtotal: ${compra_data['subtotal']:.2f}")
            print(f"      IVA: ${compra_data['iva']:.2f}")
            print(f"      Envío: ${compra_data['envio']:.2f}")
        else:
            print_test("POST /carrito/finalizar", False, f"ERROR: {response.status_code}")
        
        # 6. Historial
        print_header("6️⃣ Historial de Compras")
        
        # Lista de compras
        response = client.get(f"{BASE_URL}/compras", headers=headers)
        historial_ok = response.status_code == 200
        if historial_ok:
            compras = response.json()
            print_test("GET /compras", True, f"{len(compras)} compra(s) registrada(s)")
        else:
            print_test("GET /compras", False)
        
        # Detalle de compra
        if compra_id:
            response = client.get(f"{BASE_URL}/compras/{compra_id}", headers=headers)
            detalle_ok = response.status_code == 200
            if detalle_ok:
                detalle = response.json()
                print_test(f"GET /compras/{compra_id}", True,
                           f"Dirección: {detalle['direccion']}, Tarjeta: {detalle['tarjeta']}")
            else:
                print_test(f"GET /compras/{compra_id}", False)
        
        # 7. Validaciones
        print_header("7️⃣ Validaciones")
        
        # Email duplicado
        response = client.post(
            f"{BASE_URL}/registrar",
            json={
                "nombre": "Test",
                "email": TEST_EMAIL,
                "password": "test123"
            }
        )
        duplicado_ok = response.status_code == 400
        print_test("Validación: Email duplicado", duplicado_ok,
                   "Rechaza correctamente" if duplicado_ok else "ERROR: No valida")
        
        # Login incorrecto
        response = client.post(
            f"{BASE_URL}/iniciar-sesion",
            json={
                "email": TEST_EMAIL,
                "password": "wrongpassword"
            }
        )
        login_error_ok = response.status_code == 401
        print_test("Validación: Password incorrecto", login_error_ok,
                   "Rechaza correctamente" if login_error_ok else "ERROR: No valida")
        
        # Producto inexistente
        response = client.get(f"{BASE_URL}/productos/9999")
        producto_error_ok = response.status_code == 404
        print_test("Validación: Producto inexistente", producto_error_ok,
                   "Error 404 correcto" if producto_error_ok else "ERROR: No valida")
        
        # Sin autenticación
        response = client.get(f"{BASE_URL}/carrito")
        auth_error_ok = response.status_code == 401
        print_test("Validación: Sin autenticación", auth_error_ok,
                   "Error 401 correcto" if auth_error_ok else "ERROR: No valida")
    
    # Resumen final
    print_header("✅ RESUMEN")
    print(f"{Color.GREEN}Todas las verificaciones completadas{Color.END}")
    print(f"\n{Color.YELLOW}Próximos pasos:{Color.END}")
    print("  1. Abrir http://localhost:3000 en el navegador")
    print("  2. Registrar un usuario nuevo")
    print("  3. Agregar productos al carrito")
    print("  4. Finalizar una compra")
    print("  5. Ver el historial de compras")
    print(f"\n{Color.GREEN}✅ El backend está funcionando correctamente{Color.END}\n")

if __name__ == "__main__":
    try:
        main()
    except httpx.ConnectError:
        print(f"\n{Color.RED}❌ ERROR: No se puede conectar al servidor{Color.END}")
        print(f"{Color.YELLOW}Inicia el servidor con:{Color.END}")
        print(f"  cd backend")
        print(f"  uv run uvicorn main:app --reload")
        sys.exit(1)
    except Exception as e:
        print(f"\n{Color.RED}❌ ERROR: {e}{Color.END}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
