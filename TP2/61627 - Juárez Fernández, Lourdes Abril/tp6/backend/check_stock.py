"""
Script para reiniciar el stock usando una petición HTTP al backend
"""
import requests
import json

def reiniciar_stock_via_api():
    """Realiza peticiones al backend para verificar y mostrar el stock"""
    base_url = "http://localhost:8000"
    
    try:
        print("📦 Verificando stock actual...")
        response = requests.get(f"{base_url}/productos")
        if response.status_code == 200:
            productos = response.json()
            
            print("Estado actual del stock:")
            productos_bajo_stock = []
            for p in productos:
                stock = p.get('existencia', 0)
                print(f"  ID {p['id']}: {p['nombre'][:40]:<40} Stock: {stock}")
                if stock < 3:
                    productos_bajo_stock.append(p)
            
            if productos_bajo_stock:
                print(f"\n⚠️  {len(productos_bajo_stock)} productos con stock bajo:")
                for p in productos_bajo_stock:
                    print(f"  - ID {p['id']}: {p['nombre']} (Stock: {p['existencia']})")
                    
                print("\n💡 Para solucionar el problema de stock:")
                print("1. Puedes usar productos con stock disponible (stock >= 1)")
                print("2. O reiniciar manualmente la base de datos")
                print("3. O comprar productos diferentes")
                
                print("\n✅ Productos con stock disponible:")
                for p in productos:
                    if p.get('existencia', 0) > 0:
                        print(f"  - ID {p['id']}: {p['nombre']} (Stock: {p['existencia']})")
            else:
                print("\n✅ Todos los productos tienen stock suficiente")
                
        else:
            print(f"❌ Error al obtener productos: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ No se pudo conectar al backend. ¿Está corriendo en el puerto 8000?")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    reiniciar_stock_via_api()