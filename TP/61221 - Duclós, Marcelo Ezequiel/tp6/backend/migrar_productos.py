"""Script para migrar productos del JSON a la base de datos SQLite"""

import json
from decimal import Decimal
from pathlib import Path
from sqlmodel import Session, select

from database import engine, init_database
from models import Producto

def cargar_productos_desde_json():
    """Cargar productos desde el archivo JSON"""
    ruta_productos = Path(__file__).parent / "productos.json"
    with open(ruta_productos, "r", encoding="utf-8") as archivo:
        return json.load(archivo)

def migrar_productos():
    """Migrar productos del JSON a la base de datos"""
    print("Iniciando migración de productos...")
    
    # Inicializar base de datos (crear tablas)
    init_database()
    
    # Cargar productos del JSON
    productos_json = cargar_productos_desde_json()
    print(f"Cargando {len(productos_json)} productos desde JSON...")
    
    with Session(engine) as session:
        # Verificar si ya hay productos en la BD
        statement = select(Producto)
        productos_existentes = session.exec(statement).all()
        
        if productos_existentes:
            print(f"Ya existen {len(productos_existentes)} productos en la BD. Saltando migración.")
            return
        
        # Convertir y agregar productos
        productos_agregados = 0
        for producto_json in productos_json:
            try:
                producto = Producto(
                    id=producto_json["id"],
                    titulo=producto_json["titulo"],
                    precio=Decimal(str(producto_json["precio"])),
                    descripcion=producto_json["descripcion"],
                    categoria=producto_json["categoria"],
                    valoracion=producto_json.get("valoracion"),
                    existencia=producto_json["existencia"],
                    imagen=producto_json["imagen"]
                )
                
                session.add(producto)
                productos_agregados += 1
                print(f"Agregado: {producto.titulo} - ${producto.precio}")
                
            except Exception as e:
                print(f"Error al procesar producto {producto_json.get('id', 'unknown')}: {e}")
        
        # Guardar cambios
        session.commit()
        print(f"Migración completada: {productos_agregados} productos agregados a la BD")

def verificar_productos():
    """Verificar que los productos se cargaron correctamente"""
    with Session(engine) as session:
        statement = select(Producto)
        productos = session.exec(statement).all()
        
        print(f"\nProductos en la base de datos: {len(productos)}")
        for producto in productos[:5]:  # Mostrar solo los primeros 5
            print(f"- {producto.titulo}: ${producto.precio} (Stock: {producto.existencia})")
        
        if len(productos) > 5:
            print(f"... y {len(productos) - 5} productos más")

if __name__ == "__main__":
    try:
        migrar_productos()
        verificar_productos()
    except Exception as e:
        print(f"Error durante la migración: {e}")
        raise