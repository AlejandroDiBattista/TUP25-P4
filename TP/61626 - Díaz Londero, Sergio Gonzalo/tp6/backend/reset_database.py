#!/usr/bin/env python3
"""
Script para resetear la base de datos y recargar productos
Uso: python reset_database.py
"""

import os
import shutil
from pathlib import Path

def reset_database():
    """Elimina la base de datos para forzar recarga de productos"""
    backend_dir = Path(__file__).parent
    
    # Rutas de las bases de datos
    data_dir = backend_dir / "data"
    tienda_db = backend_dir / "tienda.db"
    
    print("🔄 Reseteando base de datos...")
    
    # Eliminar carpeta data completa
    if data_dir.exists():
        try:
            shutil.rmtree(data_dir)
            print("✅ Carpeta 'data' eliminada")
        except Exception as e:
            print(f"❌ Error al eliminar carpeta data: {e}")
    
    # Eliminar tienda.db si existe
    if tienda_db.exists():
        try:
            tienda_db.unlink()
            print("✅ Archivo 'tienda.db' eliminado")
        except Exception as e:
            print(f"❌ Error al eliminar tienda.db: {e}")
    
    print("✅ Base de datos reseteada exitosamente")
    print("💡 Ahora inicia el servidor backend para cargar productos frescos:")
    print("   uvicorn main:app --reload --port 8000")

if __name__ == "__main__":
    reset_database()