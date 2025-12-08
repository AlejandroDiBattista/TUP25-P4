"""Script para actualizar el stock de todos los productos sin eliminar la BD"""
from sqlmodel import Session, create_engine, select
from models.productos import Producto
from database import DB_PATH
import json
from pathlib import Path

# Conectar a BD existente
engine = create_engine(f"sqlite:///{DB_PATH}")

# Cargar productos de JSON
ruta_productos = Path(__file__).parent / "productos.json"
with open(ruta_productos, "r", encoding="utf-8") as archivo:
    productos_json = json.load(archivo)

# Crear diccionario de stocks
stocks = {p["id"]: p["existencia"] for p in productos_json}

# Actualizar stock en BD
with Session(engine) as session:
    productos_db = session.exec(select(Producto)).all()
    
    print("Actualizando stock de productos:\n")
    actualizados = 0
    for producto in productos_db:
        stock_original = producto.existencia
        stock_nuevo = stocks.get(producto.id, 5)  # Default: 5
        
        producto.existencia = stock_nuevo
        session.add(producto)
        actualizados += 1
        
        print(f"ID {producto.id:2}: {producto.nombre[:35]:<35} | {stock_original} → {stock_nuevo}")
    
    session.commit()
    print(f"\n✅ {actualizados} productos actualizados")

print("\n✅ Stock restablecido exitosamente")
print("ℹ️  El servidor puede seguir corriendo, los cambios se reflejarán inmediatamente")
