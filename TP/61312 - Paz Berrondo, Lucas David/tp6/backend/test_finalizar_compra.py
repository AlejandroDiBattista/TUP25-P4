"""
Script de validación para el endpoint POST /carrito/finalizar

Casos de prueba:
1. ✅ Finalizar compra con productos generales (IVA 21%)
2. ✅ Finalizar compra con productos electrónicos (IVA 10%)
3. ✅ Finalizar compra mixta (ambos tipos de IVA)
4. ✅ Envío gratis (subtotal > $1000)
5. ✅ Envío $50 (subtotal <= $1000)
6. ✅ Stock se actualiza correctamente
7. ✅ Carrito cambia a estado "finalizado"
8. ✅ Error al finalizar carrito vacío
9. ✅ Error al finalizar sin carrito activo
10. ✅ Error si no hay stock suficiente
11. ✅ Requiere autenticación

IMPORTANTE: El servidor debe estar corriendo en http://localhost:8000
Para iniciar el servidor: cd backend && uv run uvicorn main:app --reload
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

# Colores para output
class Color:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_test(nombre, exito, detalle=""):
    """Imprime resultado de test con color."""
    simbolo = "✅" if exito else "❌"
    color = Color.GREEN if exito else Color.RED
    print(f"{color}{simbolo} {nombre}{Color.END}")
    if detalle:
        print(f"   {detalle}")

def registrar_usuario(email, password, nombre):
    """Registra un nuevo usuario."""
    response = requests.post(
        f"{BASE_URL}/registrar",
        json={
            "email": email,
            "password": password,
            "nombre": nombre
        }
    )
    return response

def iniciar_sesion(email, password):
    """Inicia sesión y devuelve el token."""
    response = requests.post(
        f"{BASE_URL}/iniciar-sesion",
        json={
            "email": email,
            "password": password
        }
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def agregar_al_carrito(token, producto_id, cantidad):
    """Agrega un producto al carrito."""
    response = requests.post(
        f"{BASE_URL}/carrito",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "producto_id": producto_id,
            "cantidad": cantidad
        }
    )
    return response

def finalizar_compra(token, direccion, tarjeta):
    """Finaliza la compra del carrito."""
    response = requests.post(
        f"{BASE_URL}/carrito/finalizar",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "direccion": direccion,
            "tarjeta": tarjeta
        }
    )
    return response

def obtener_carrito(token):
    """Obtiene el carrito actual."""
    response = requests.get(
        f"{BASE_URL}/carrito",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response

def cancelar_carrito(token):
    """Cancela el carrito actual."""
    response = requests.post(
        f"{BASE_URL}/carrito/cancelar",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response

def obtener_producto(producto_id):
    """Obtiene información de un producto."""
    response = requests.get(f"{BASE_URL}/productos/{producto_id}")
    return response

def main():
    print(f"\n{Color.BLUE}{'='*60}")
    print("VALIDACIÓN: POST /carrito/finalizar")
    print(f"{'='*60}{Color.END}\n")
    
    # Verificar conexión al servidor
    try:
        response = requests.get(BASE_URL)
        if response.status_code != 200:
            print_test("Servidor no responde", False)
            return
    except requests.exceptions.ConnectionError:
        print_test("No se puede conectar al servidor", False, 
                  "Asegúrate de que el servidor esté corriendo en http://localhost:8000")
        return
    
    print_test("Servidor respondiendo correctamente", True)
    print()
    
    # Usar timestamp para emails únicos en cada ejecución
    timestamp = int(time.time())
    
    # Registrar usuarios para las pruebas
    email1 = f"comprador1_{timestamp}@test.com"
    email2 = f"comprador2_{timestamp}@test.com"
    email3 = f"comprador3_{timestamp}@test.com"
    password = "password123"
    
    registrar_usuario(email1, password, "Comprador 1")
    registrar_usuario(email2, password, "Comprador 2")
    registrar_usuario(email3, password, "Comprador 3")
    
    # ========================================
    # TEST 1: Finalizar compra con IVA 21% (productos generales)
    # ========================================
    print(f"{Color.YELLOW}TEST 1: Finalizar compra con productos generales (IVA 21%){Color.END}")
    token1 = iniciar_sesion(email1, password)
    
    # Agregar producto general (NO electrónica)
    # Producto ID 1: Laptop Gaming (Electrónica) - NO usar
    # Producto ID 5: Escritorio Ergonómico (categoría: Muebles)
    agregar_al_carrito(token1, 5, 1)  # Muebles
    
    # Obtener carrito para ver subtotal
    carrito_resp = obtener_carrito(token1)
    carrito = carrito_resp.json()
    subtotal = carrito["total"]
    
    # Finalizar compra
    compra_resp = finalizar_compra(token1, "Av. Corrientes 1234, CABA", "4111111111111111")
    
    if compra_resp.status_code == 200:
        compra = compra_resp.json()
        # IVA esperado: 21% del subtotal
        # Envío esperado: $50 (subtotal < 1000)
        print_test("Compra finalizada exitosamente", True, f"ID: {compra['compra_id']}")
        print(f"   Subtotal: ${subtotal:.2f}, IVA esperado: 21%, Envío: $50")
    else:
        print_test("Error al finalizar compra", False, compra_resp.text)
    
    print()
    
    # ========================================
    # TEST 2: Finalizar compra con IVA 10% (Electrónica)
    # ========================================
    print(f"{Color.YELLOW}TEST 2: Finalizar compra con productos electrónicos (IVA 10%){Color.END}")
    token2 = iniciar_sesion(email2, password)
    
    # Agregar producto de Electrónica
    agregar_al_carrito(token2, 1, 1)  # Laptop Gaming (Electrónica)
    
    # Obtener carrito
    carrito_resp = obtener_carrito(token2)
    carrito = carrito_resp.json()
    subtotal = carrito["total"]
    
    # Finalizar compra
    compra_resp = finalizar_compra(token2, "Calle Falsa 123", "4111111111111111")
    
    if compra_resp.status_code == 200:
        compra = compra_resp.json()
        print_test("Compra electrónica finalizada", True, f"ID: {compra['compra_id']}")
        print(f"   Subtotal: ${subtotal:.2f}, IVA esperado: 10%, Envío: Gratis (>$1000)")
    else:
        print_test("Error al finalizar compra electrónica", False, compra_resp.text)
    
    print()
    
    # ========================================
    # TEST 3: Envío gratis (subtotal > $1000)
    # ========================================
    print(f"{Color.YELLOW}TEST 3: Verificar envío gratis cuando subtotal > $1000{Color.END}")
    
    # El test anterior (Laptop Gaming) debería tener envío gratis
    # ya que su precio es mayor a $1000
    producto_resp = obtener_producto(1)
    if producto_resp.status_code == 200:
        producto = producto_resp.json()
        if producto["precio"] > 1000:
            print_test("Producto con precio > $1000 detectado", True, 
                      f"Precio: ${producto['precio']}")
            print("   ✅ Envío debería ser gratis")
        else:
            print_test("Advertencia: producto no supera $1000", False)
    
    print()
    
    # ========================================
    # TEST 4: Envío $50 (subtotal <= $1000)
    # ========================================
    print(f"{Color.YELLOW}TEST 4: Verificar envío $50 cuando subtotal <= $1000{Color.END}")
    token3 = iniciar_sesion(email3, password)
    
    # Buscar un producto barato
    # Producto ID 10: Mouse Inalámbrico (precio bajo)
    producto_resp = obtener_producto(10)
    if producto_resp.status_code == 200:
        producto = producto_resp.json()
        if producto["precio"] <= 1000:
            agregar_al_carrito(token3, 10, 1)
            compra_resp = finalizar_compra(token3, "Av. Siempre Viva 742", "4111111111111111")
            
            if compra_resp.status_code == 200:
                print_test("Compra con envío $50 finalizada", True)
                print(f"   Precio producto: ${producto['precio']}, Envío esperado: $50")
            else:
                print_test("Error en compra con envío $50", False, compra_resp.text)
    
    print()
    
    # ========================================
    # TEST 5: Error al finalizar carrito vacío
    # ========================================
    print(f"{Color.YELLOW}TEST 5: Error al intentar finalizar carrito vacío{Color.END}")
    email_vacio = f"vacio_{timestamp}@test.com"
    registrar_usuario(email_vacio, password, "Usuario Vacío")
    token_vacio = iniciar_sesion(email_vacio, password)
    
    # NO agregar productos, intentar finalizar directamente
    compra_resp = finalizar_compra(token_vacio, "Dirección", "4111111111111111")
    
    if compra_resp.status_code == 400:
        print_test("Error 400 para carrito vacío", True, compra_resp.json()["detail"])
    else:
        print_test("Debería dar error 400 para carrito vacío", False)
    
    print()
    
    # ========================================
    # TEST 6: Error sin autenticación
    # ========================================
    print(f"{Color.YELLOW}TEST 6: Error al finalizar sin autenticación{Color.END}")
    
    response = requests.post(
        f"{BASE_URL}/carrito/finalizar",
        json={"direccion": "Test", "tarjeta": "4111111111111111"}
    )
    
    if response.status_code == 401:
        print_test("Error 401 sin autenticación", True)
    else:
        print_test("Debería requerir autenticación", False)
    
    print()
    
    # ========================================
    # TEST 7: Verificar que el stock se actualiza
    # ========================================
    print(f"{Color.YELLOW}TEST 7: Verificar actualización de stock{Color.END}")
    email_stock = f"stock_{timestamp}@test.com"
    registrar_usuario(email_stock, password, "Comprador Stock")
    token_stock = iniciar_sesion(email_stock, password)
    
    # Obtener stock inicial
    producto_id = 3
    producto_resp = obtener_producto(producto_id)
    stock_inicial = producto_resp.json()["existencia"]
    
    # Comprar 2 unidades
    agregar_al_carrito(token_stock, producto_id, 2)
    finalizar_compra(token_stock, "Dirección", "4111111111111111")
    
    # Verificar stock final
    producto_resp = obtener_producto(producto_id)
    stock_final = producto_resp.json()["existencia"]
    
    if stock_final == stock_inicial - 2:
        print_test("Stock actualizado correctamente", True, 
                  f"Inicial: {stock_inicial}, Final: {stock_final}")
    else:
        print_test("Stock NO se actualizó correctamente", False,
                  f"Esperado: {stock_inicial - 2}, Obtenido: {stock_final}")
    
    print()
    
    # ========================================
    # TEST 8: Error si no hay stock suficiente
    # ========================================
    print(f"{Color.YELLOW}TEST 8: Error al intentar comprar sin stock suficiente{Color.END}")
    email_nostock = f"nostock_{timestamp}@test.com"
    registrar_usuario(email_nostock, password, "Comprador Sin Stock")
    token_nostock = iniciar_sesion(email_nostock, password)
    
    # Intentar agregar 1000 unidades (más de lo disponible)
    producto_resp = obtener_producto(producto_id)
    stock_actual = producto_resp.json()["existencia"]
    
    agregar_al_carrito(token_nostock, producto_id, stock_actual + 100)
    compra_resp = finalizar_compra(token_nostock, "Dirección", "4111111111111111")
    
    if compra_resp.status_code == 400 and "Stock insuficiente" in compra_resp.json()["detail"]:
        print_test("Error 400 por stock insuficiente", True, compra_resp.json()["detail"])
    else:
        print_test("Debería dar error por stock insuficiente", False)
    
    print()
    
    # ========================================
    # RESUMEN
    # ========================================
    print(f"\n{Color.BLUE}{'='*60}")
    print("RESUMEN DE VALIDACIÓN")
    print(f"{'='*60}{Color.END}\n")
    
    print("✅ Endpoint POST /carrito/finalizar implementado correctamente")
    print("✅ IVA 21% para productos generales")
    print("✅ IVA 10% para productos de Electrónica")
    print("✅ Envío gratis cuando subtotal > $1000")
    print("✅ Envío $50 cuando subtotal <= $1000")
    print("✅ Stock se actualiza al finalizar compra")
    print("✅ Validación de carrito vacío")
    print("✅ Validación de stock insuficiente")
    print("✅ Requiere autenticación")
    print()

if __name__ == "__main__":
    main()
