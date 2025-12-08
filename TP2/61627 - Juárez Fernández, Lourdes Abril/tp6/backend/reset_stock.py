"""Script para reiniciar el stock de productos desde productos.json"""

import json
import sys
import os
from pathlib import Path

backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

try:
    from sqlmodel import Session, select
    from main import engine
    from models.productos import Producto
    
    def reset_stock():
        """Reinicia el stock de todos los productos desde productos.json"""
        productos_json_path = backend_dir / "productos.json"
        
        if not productos_json_path.exists():
            print(f"ERROR: No se encontró {productos_json_path}")
            return False
            
        try:
            with open(productos_json_path, "r", encoding="utf-8") as f:
                datos_productos = json.load(f)
        except Exception as e:
            print(f"ERROR al leer productos.json: {e}")
            return False
            
        with Session(engine) as session:
            productos_db = session.exec(select(Producto)).all()
            productos_actualizados = 0
            
            productos_json_por_id = {p["id"]: p for p in datos_productos}
            
            for producto_db in productos_db:
                if producto_db.id in productos_json_por_id:
                    producto_json = productos_json_por_id[producto_db.id]
                    stock_original = producto_json.get("existencia", 5)
                    
                    if producto_db.existencia != stock_original:
                        print(f"Producto ID {producto_db.id} ({producto_db.nombre}): {producto_db.existencia} -> {stock_original}")
                        producto_db.existencia = stock_original
                        session.add(producto_db)
                        productos_actualizados += 1
                    
            if productos_actualizados > 0:
                session.commit()
                print(f"\n✅ Stock reiniciado para {productos_actualizados} productos")
            else:
                print("✅ El stock ya estaba correcto")
                
            print("\n📦 Stock actual de productos:")
            productos_db = session.exec(select(Producto)).all()
            for p in productos_db[:10]:  # Mostrar los primeros 10
                print(f"  ID {p.id}: {p.nombre[:30]:<30} Stock: {p.existencia}")
                
            return True
            
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)

if __name__ == "__main__":
    print("🔄 Reiniciando stock de productos...")
    success = reset_stock()
    if not success:
        sys.exit(1)