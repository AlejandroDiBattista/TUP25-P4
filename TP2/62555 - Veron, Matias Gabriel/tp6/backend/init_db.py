"""
Script para inicializar la base de datos con productos desde el archivo JSON.
Ejecutar: python init_db.py
"""

import json
import sys
import os
from pathlib import Path

# Agregar el directorio actual al path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import create_db_and_tables, get_session
from app.models.productos import Producto
from app.models.carritos import Carrito, CarritoItem
from sqlmodel import select

def cargar_productos_desde_json():
    """Carga productos desde el archivo JSON y los inserta en la base de datos"""
    print("🔄 Iniciando carga de productos...")
    
    # Crear tablas
    create_db_and_tables()
    
    # Cargar datos del JSON
    json_path = Path(__file__).parent / "app" / "data" / "productos.json"
    if not json_path.exists():
        print(f"❌ No se encontró el archivo {json_path}")
        return
    
    with open(json_path, "r", encoding="utf-8") as archivo:
        productos_data = json.load(archivo)
    
    # Insertar productos en la base de datos
    session_gen = get_session()
    session = next(session_gen)
    
    try:
        # Verificar si ya hay productos
        existing_products = session.exec(select(Producto)).all()
        existing_count = len(existing_products)
        
        if existing_count > 0:
            print(f"⚠️  Ya hay {existing_count} productos en la base de datos.")
            # Verificar si se pasó argumento --force
            if len(sys.argv) > 1 and sys.argv[1] == '--force':
                response = 's'
            else:
                response = input("¿Desea reemplazarlos? (s/N): ")
            if response.lower() != 's':
                print("❌ Operación cancelada.")
                return
            
            # Primero eliminar todos los items del carrito
            cart_items = session.exec(select(CarritoItem)).all()
            for item in cart_items:
                session.delete(item)
            session.commit()
            print(f"🗑️  {len(cart_items)} items del carrito eliminados.")
            
            # Luego eliminar productos existentes
            for producto in existing_products:
                session.delete(producto)
            session.commit()
            print("🗑️  Productos existentes eliminados.")
        
        # Insertar nuevos productos
        productos_insertados = 0
        for producto_data in productos_data:
            # Mapear campos del JSON a los campos del modelo
            # Corregir la ruta de imagen: quitar el prefijo "imagenes/"
            imagen_path = producto_data["imagen"]
            if imagen_path.startswith("imagenes/"):
                imagen_path = imagen_path.replace("imagenes/", "")
            
            producto = Producto(
                id=producto_data["id"],
                nombre=producto_data["titulo"],  # titulo -> nombre
                precio=producto_data["precio"],
                descripcion=producto_data["descripcion"],
                categoria=producto_data["categoria"],
                imagen=imagen_path,  # Solo el nombre del archivo
                existencia=producto_data["existencia"]
            )
            session.add(producto)
            productos_insertados += 1
        
        session.commit()
        print(f"✅ {productos_insertados} productos insertados correctamente.")
        
    except Exception as e:
        session.rollback()
        print(f"❌ Error al insertar productos: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        session.close()

if __name__ == "__main__":
    cargar_productos_desde_json()