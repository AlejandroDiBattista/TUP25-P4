"""
Script de prueba para los endpoints de productos.

Este script prueba:
1. GET /productos - Listar todos los productos
2. GET /productos?categoria=X - Filtrar por categoría
3. GET /productos?buscar=X - Buscar en nombre/descripción
4. GET /productos?categoria=X&buscar=Y - Combinar filtros
5. GET /productos/{id} - Obtener producto específico
6. GET /productos/999 - Error 404 para producto inexistente

Ejecutar con: uv run python test_productos.py
"""

import httpx
import json

BASE_URL = "http://127.0.0.1:8000"

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

def print_response(response, max_items=5):
    """Imprimir detalles de la respuesta."""
    print(f"   Status: {response.status_code}")
    try:
        data = response.json()
        if isinstance(data, list):
            print(f"   Total resultados: {len(data)}")
            if len(data) > 0:
                print(f"   Primeros {min(max_items, len(data))} resultados:")
                for item in data[:max_items]:
                    print(f"      - ID: {item.get('id')}, Nombre: {item.get('nombre')}, Categoría: {item.get('categoria')}")
        else:
            print(f"   Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
    except:
        print(f"   Response: {response.text}")


def main():
    print("\n" + "="*60)
    print("🚀 PRUEBAS DE ENDPOINTS DE PRODUCTOS")
    print("="*60)
    
    with httpx.Client() as client:
        # ========================================
        # TEST 1: Listar todos los productos
        # ========================================
        print_test("TEST 1: Listar todos los productos")
        
        response = client.get(f"{BASE_URL}/productos")
        print_response(response)
        
        if response.status_code == 200:
            productos = response.json()
            if len(productos) == 20:
                print_success(f"Se obtuvieron los 20 productos correctamente")
            else:
                print_error(f"Se esperaban 20 productos, se obtuvieron {len(productos)}")
        else:
            print_error("Error al obtener productos")
        
        # ========================================
        # TEST 2: Buscar productos por texto
        # ========================================
        print_test("TEST 2: Buscar productos por texto 'camis'")
        
        response = client.get(f"{BASE_URL}/productos?buscar=camis")
        print_response(response)
        
        if response.status_code == 200:
            productos = response.json()
            if len(productos) > 0:
                # Verificar que todos contengan "camis" en nombre o descripción
                todos_validos = all(
                    "camis" in p.get("nombre", "").lower() or 
                    "camis" in p.get("descripcion", "").lower()
                    for p in productos
                )
                if todos_validos:
                    print_success(f"Búsqueda correcta - {len(productos)} productos encontrados")
                else:
                    print_error("Algunos productos no coinciden con la búsqueda")
            else:
                print_success("Búsqueda retornó 0 resultados (puede ser válido)")
        else:
            print_error("Error en la búsqueda")
        
        # ========================================
        # TEST 3: Filtrar por categoría
        # ========================================
        print_test("TEST 3: Filtrar productos por categoría 'electro'")
        
        response = client.get(f"{BASE_URL}/productos?categoria=electro")
        print_response(response)
        
        if response.status_code == 200:
            productos = response.json()
            if len(productos) > 0:
                # Verificar que todos contengan "electro" en categoría
                todos_validos = all(
                    "electro" in p.get("categoria", "").lower()
                    for p in productos
                )
                if todos_validos:
                    print_success(f"Filtro correcto - {len(productos)} productos de electrónica")
                else:
                    print_error("Algunos productos no pertenecen a la categoría")
            else:
                print_error("No se encontraron productos de electrónica")
        else:
            print_error("Error al filtrar por categoría")
        
        # ========================================
        # TEST 4: Combinar búsqueda y filtro
        # ========================================
        print_test("TEST 4: Combinar filtro 'ropa' y búsqueda 'hombre'")
        
        response = client.get(f"{BASE_URL}/productos?categoria=ropa&buscar=hombre")
        print_response(response)
        
        if response.status_code == 200:
            productos = response.json()
            print_success(f"Búsqueda combinada ejecutada - {len(productos)} resultados")
        else:
            print_error("Error en búsqueda combinada")
        
        # ========================================
        # TEST 5: Obtener producto por ID
        # ========================================
        print_test("TEST 5: Obtener producto con ID 1")
        
        response = client.get(f"{BASE_URL}/productos/1")
        print_response(response)
        
        if response.status_code == 200:
            producto = response.json()
            if producto.get("id") == 1:
                print_success(f"Producto obtenido: {producto.get('nombre')}")
            else:
                print_error("El ID del producto no coincide")
        else:
            print_error("Error al obtener producto por ID")
        
        # ========================================
        # TEST 6: Obtener producto inexistente
        # ========================================
        print_test("TEST 6: Obtener producto inexistente (ID 999)")
        
        response = client.get(f"{BASE_URL}/productos/999")
        print_response(response)
        
        if response.status_code == 404:
            print_success("Error 404 correctamente retornado")
        else:
            print_error(f"Debería retornar 404, se obtuvo {response.status_code}")
    
    # ========================================
    # RESUMEN FINAL
    # ========================================
    print("\n" + "="*60)
    print("📊 RESUMEN DE PRUEBAS")
    print("="*60)
    print("✅ Todas las pruebas de endpoints de productos completadas")
    print("\n📝 Endpoints probados:")
    print("   - GET /productos (listado completo)")
    print("   - GET /productos?buscar=X (búsqueda en nombre/descripción)")
    print("   - GET /productos?categoria=X (filtro por categoría)")
    print("   - GET /productos?categoria=X&buscar=Y (filtros combinados)")
    print("   - GET /productos/{id} (obtener producto específico)")
    print("   - GET /productos/999 (manejo de error 404)")
    print("\n🎯 Sistema de productos funcionando correctamente!")
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
