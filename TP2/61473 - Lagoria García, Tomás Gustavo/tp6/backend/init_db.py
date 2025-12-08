"""
Script para inicializar la base de datos.

Crea las tablas y carga datos iniciales de productos desde productos.json.
"""
import json
from pathlib import Path
from sqlmodel import Session, select

from database import engine, crear_tablas, borrar_tablas
from models import Producto


def cargar_productos_desde_json():
    """
    Carga los productos desde productos.json a la base de datos.
    
    Solo carga productos que no existan (verifica por ID).
    """
    # Leer archivo JSON
    ruta_productos = Path(__file__).parent / "productos.json"
    
    with open(ruta_productos, "r", encoding="utf-8") as archivo:
        productos_data = json.load(archivo)
    
    print(f"📦 Leyendo {len(productos_data)} productos desde productos.json...")
    
    # Insertar productos en la base de datos
    with Session(engine) as session:
        productos_insertados = 0
        productos_existentes = 0
        
        for producto_dict in productos_data:
            # Verificar si el producto ya existe
            producto_existente = session.get(Producto, producto_dict["id"])
            
            if producto_existente:
                productos_existentes += 1
                continue
            
            # Crear producto (ajustar nombres de campos si es necesario)
            producto = Producto(
                id=producto_dict["id"],
                titulo=producto_dict["titulo"],
                descripcion=producto_dict["descripcion"],
                precio=producto_dict["precio"],
                categoria=producto_dict["categoria"],
                valoracion=producto_dict.get("valoracion", 0.0),
                existencia=producto_dict.get("existencia", 0),
                imagen=producto_dict["imagen"]
            )
            
            session.add(producto)
            productos_insertados += 1
        
        session.commit()
        
        print(f"✅ {productos_insertados} productos nuevos insertados")
        if productos_existentes > 0:
            print(f"ℹ️  {productos_existentes} productos ya existían")


def inicializar_base_datos(reset: bool = False):
    """
    Inicializa la base de datos completa.
    
    Args:
        reset: Si es True, elimina todas las tablas antes de crearlas
    """
    print("=" * 60)
    print("🚀 INICIALIZANDO BASE DE DATOS")
    print("=" * 60)
    
    if reset:
        print("\n⚠️  MODO RESET: Eliminando tablas existentes...")
        borrar_tablas()
        print()
    
    # Crear todas las tablas
    print("📋 Creando tablas...")
    crear_tablas()
    print()
    
    # Cargar productos iniciales
    print("📦 Cargando productos iniciales...")
    cargar_productos_desde_json()
    
    print("\n" + "=" * 60)
    print("✅ BASE DE DATOS INICIALIZADA CORRECTAMENTE")
    print("=" * 60)
    print("\nPuedes iniciar el servidor con:")
    print("  uv run uvicorn main:app --reload")
    print()


if __name__ == "__main__":
    # Importar todos los modelos para que SQLModel los detecte
    from models import (
        Usuario, Producto, Carrito, ItemCarrito, 
        Compra, ItemCompra
    )
    
    import sys
    
    # Verificar si se quiere hacer reset
    reset = "--reset" in sys.argv or "-r" in sys.argv
    
    if reset:
        respuesta = input("\n⚠️  ¿Estás seguro de eliminar todas las tablas? (s/N): ")
        if respuesta.lower() != "s":
            print("❌ Operación cancelada")
            sys.exit(0)
    
    inicializar_base_datos(reset=reset)
