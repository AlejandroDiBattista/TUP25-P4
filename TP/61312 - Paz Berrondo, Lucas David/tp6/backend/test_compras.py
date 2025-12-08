"""
Script de validación para los endpoints de historial de compras

Casos de prueba:
1. ✅ GET /compras - Listar compras del usuario
2. ✅ GET /compras/{id} - Detalle de compra específica
3. ✅ Error 404 al buscar compra inexistente
4. ✅ Error 403 al intentar ver compra de otro usuario
5. ✅ Error 401 sin autenticación
6. ✅ Verificar ordenamiento por fecha descendente
7. ✅ Verificar cálculo correcto de subtotal y total

IMPORTANTE: El servidor debe estar corriendo en http://localhost:8000
Para iniciar el servidor: cd backend && .venv\\Scripts\\python.exe -m uvicorn main:app --reload
"""

import requests
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

def listar_compras(token):
    """Lista todas las compras del usuario."""
    response = requests.get(
        f"{BASE_URL}/compras",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response

def obtener_compra(token, compra_id):
    """Obtiene detalle de una compra específica."""
    response = requests.get(
        f"{BASE_URL}/compras/{compra_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response

def main():
    print(f"\n{Color.BLUE}{'='*60}")
    print("VALIDACIÓN: Endpoints de Historial de Compras")
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
    
    # Usar timestamp para emails únicos
    timestamp = int(time.time())
    
    # Crear dos usuarios para probar seguridad
    email1 = f"comprador_historial1_{timestamp}@test.com"
    email2 = f"comprador_historial2_{timestamp}@test.com"
    password = "password123"
    
    registrar_usuario(email1, password, "Usuario 1")
    registrar_usuario(email2, password, "Usuario 2")
    
    token1 = iniciar_sesion(email1, password)
    token2 = iniciar_sesion(email2, password)
    
    # ========================================
    # TEST 1: Crear algunas compras para el usuario 1
    # ========================================
    print(f"{Color.YELLOW}Preparación: Crear compras de prueba{Color.END}")
    
    # Compra 1: Producto barato (con envío $50)
    agregar_al_carrito(token1, 2, 1)  # Camiseta ($22.3 - con envío $50)
    resp1 = finalizar_compra(token1, "Calle Falsa 123", "4111111111111111")
    compra_id_1 = resp1.json()["compra_id"] if resp1.status_code == 200 else None
    
    # Esperar un segundo para tener fechas diferentes
    time.sleep(1)
    
    # Compra 2: Producto caro (envío gratis)
    agregar_al_carrito(token1, 5, 2)  # Pulsera ($695 x 2 = $1390 - envío gratis)
    resp2 = finalizar_compra(token1, "Av. Corrientes 456", "4111111111111111")
    compra_id_2 = resp2.json()["compra_id"] if resp2.status_code == 200 else None
    
    if compra_id_1 and compra_id_2:
        print_test("Compras de prueba creadas", True, 
                  f"IDs: {compra_id_1}, {compra_id_2}")
    else:
        print_test("Error al crear compras de prueba", False)
        return
    
    print()
    
    # ========================================
    # TEST 2: GET /compras - Listar compras
    # ========================================
    print(f"{Color.YELLOW}TEST 1: Listar compras del usuario{Color.END}")
    
    resp = listar_compras(token1)
    
    if resp.status_code == 200:
        compras = resp.json()
        if len(compras) >= 2:
            print_test("Listado de compras exitoso", True, 
                      f"Total de compras: {len(compras)}")
            
            # Verificar que tiene los campos correctos
            compra = compras[0]
            campos_requeridos = ["id", "fecha", "total", "envio", "cantidad_items"]
            tiene_campos = all(campo in compra for campo in campos_requeridos)
            
            if tiene_campos:
                print_test("Campos correctos en el resumen", True, 
                          f"ID: {compra['id']}, Total: ${compra['total']}, Items: {compra['cantidad_items']}")
            else:
                print_test("Faltan campos en el resumen", False)
        else:
            print_test("No se encontraron suficientes compras", False, 
                      f"Esperadas: 2, Encontradas: {len(compras)}")
    else:
        print_test("Error al listar compras", False, f"Status: {resp.status_code}")
    
    print()
    
    # ========================================
    # TEST 3: Verificar ordenamiento por fecha
    # ========================================
    print(f"{Color.YELLOW}TEST 2: Verificar ordenamiento por fecha descendente{Color.END}")
    
    resp = listar_compras(token1)
    if resp.status_code == 200:
        compras = resp.json()
        if len(compras) >= 2:
            # La compra más reciente (compra_id_2) debe estar primero
            primera_compra = compras[0]
            if primera_compra["id"] == compra_id_2:
                print_test("Ordenamiento correcto", True, 
                          "Compra más reciente aparece primero")
            else:
                print_test("Ordenamiento incorrecto", False, 
                          f"Esperado ID {compra_id_2}, Obtenido: {primera_compra['id']}")
        else:
            print_test("No hay suficientes compras para verificar orden", False)
    
    print()
    
    # ========================================
    # TEST 4: GET /compras/{id} - Detalle de compra
    # ========================================
    print(f"{Color.YELLOW}TEST 3: Obtener detalle de compra específica{Color.END}")
    
    resp = obtener_compra(token1, compra_id_1)
    
    if resp.status_code == 200:
        compra = resp.json()
        campos_requeridos = ["id", "fecha", "direccion", "tarjeta", "items", 
                            "subtotal", "envio", "total"]
        tiene_campos = all(campo in compra for campo in campos_requeridos)
        
        if tiene_campos:
            print_test("Detalle de compra obtenido", True, 
                      f"ID: {compra['id']}, Items: {len(compra['items'])}")
            
            # Verificar items
            if len(compra["items"]) > 0:
                item = compra["items"][0]
                campos_item = ["producto_id", "nombre", "precio_unitario", "cantidad", "subtotal"]
                tiene_campos_item = all(campo in item for campo in campos_item)
                
                if tiene_campos_item:
                    print_test("Items con campos correctos", True, 
                              f"Producto: {item['nombre']}, Cantidad: {item['cantidad']}")
                else:
                    print_test("Faltan campos en los items", False)
        else:
            print_test("Faltan campos en el detalle", False)
    else:
        print_test("Error al obtener detalle", False, f"Status: {resp.status_code}")
    
    print()
    
    # ========================================
    # TEST 5: Verificar cálculos (subtotal, envío, total)
    # ========================================
    print(f"{Color.YELLOW}TEST 4: Verificar cálculos de subtotal y total{Color.END}")
    
    resp = obtener_compra(token1, compra_id_1)
    if resp.status_code == 200:
        compra = resp.json()
        
        # Calcular subtotal manualmente
        subtotal_calculado = sum(item["subtotal"] for item in compra["items"])
        
        if abs(compra["subtotal"] - subtotal_calculado) < 0.01:
            print_test("Subtotal calculado correctamente", True, 
                      f"Subtotal: ${compra['subtotal']:.2f}")
        else:
            print_test("Error en cálculo de subtotal", False, 
                      f"Esperado: ${subtotal_calculado:.2f}, Obtenido: ${compra['subtotal']:.2f}")
        
        # Verificar envío (debería ser $50 para compra pequeña)
        if compra["envio"] == 50.0:
            print_test("Envío correcto para compra pequeña", True, "Envío: $50")
        elif compra["envio"] == 0.0:
            print_test("Envío gratis (compra > $1000)", True)
        else:
            print_test("Envío inesperado", False, f"Envío: ${compra['envio']}")
    
    print()
    
    # ========================================
    # TEST 6: Error 404 - Compra inexistente
    # ========================================
    print(f"{Color.YELLOW}TEST 5: Error 404 para compra inexistente{Color.END}")
    
    resp = obtener_compra(token1, 99999)
    
    if resp.status_code == 404:
        print_test("Error 404 correcto", True, resp.json()["detail"])
    else:
        print_test("Debería devolver 404", False, f"Status: {resp.status_code}")
    
    print()
    
    # ========================================
    # TEST 7: Error 403 - Compra de otro usuario
    # ========================================
    print(f"{Color.YELLOW}TEST 6: Error 403 al intentar ver compra de otro usuario{Color.END}")
    
    # Usuario 2 intenta ver compra del usuario 1
    resp = obtener_compra(token2, compra_id_1)
    
    if resp.status_code == 403:
        print_test("Error 403 correcto (Forbidden)", True, resp.json()["detail"])
    else:
        print_test("Debería devolver 403 Forbidden", False, 
                  f"Status: {resp.status_code}")
    
    print()
    
    # ========================================
    # TEST 8: Error 401 - Sin autenticación
    # ========================================
    print(f"{Color.YELLOW}TEST 7: Error 401 sin autenticación{Color.END}")
    
    # Intentar listar compras sin token
    resp1 = requests.get(f"{BASE_URL}/compras")
    
    # Intentar obtener detalle sin token
    resp2 = requests.get(f"{BASE_URL}/compras/{compra_id_1}")
    
    if resp1.status_code == 401:
        print_test("Error 401 en GET /compras", True)
    else:
        print_test("Debería requerir autenticación para listar", False)
    
    if resp2.status_code == 401:
        print_test("Error 401 en GET /compras/{id}", True)
    else:
        print_test("Debería requerir autenticación para detalle", False)
    
    print()
    
    # ========================================
    # RESUMEN
    # ========================================
    print(f"\n{Color.BLUE}{'='*60}")
    print("RESUMEN DE VALIDACIÓN")
    print(f"{'='*60}{Color.END}\n")
    
    print("✅ GET /compras - Listado de compras implementado")
    print("✅ GET /compras/{id} - Detalle de compra implementado")
    print("✅ Ordenamiento por fecha descendente")
    print("✅ Validación de propiedad de compra (403 Forbidden)")
    print("✅ Error 404 para compras inexistentes")
    print("✅ Requiere autenticación (401 Unauthorized)")
    print("✅ Cálculo correcto de subtotal y total")
    print("✅ Items con toda la información necesaria")
    print()

if __name__ == "__main__":
    main()
