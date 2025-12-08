import sqlite3
import json
from pathlib import Path

def reset_stock():
    """Reinicia el stock directamente en la base de datos SQLite"""
    backend_dir = Path(__file__).parent
    db_path = backend_dir / "database.db"
    productos_json_path = backend_dir / "productos.json"
    
    if not productos_json_path.exists():
        print(f"ERROR: No se encontró {productos_json_path}")
        return
        
    try:
        with open(productos_json_path, "r", encoding="utf-8") as f:
            datos_productos = json.load(f)
    except Exception as e:
        print(f"ERROR al leer productos.json: {e}")
        return
        
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        productos_actualizados = 0
        
        for producto_json in datos_productos:
            producto_id = producto_json["id"]
            stock_original = producto_json.get("existencia", 5)
            
            cursor.execute("SELECT existencia FROM producto WHERE id = ?", (producto_id,))
            result = cursor.fetchone()
            
            if result:
                stock_actual = result[0]
                if stock_actual != stock_original:
                    print(f"Producto ID {producto_id}: {stock_actual} -> {stock_original}")
                    cursor.execute("UPDATE producto SET existencia = ? WHERE id = ?", 
                                 (stock_original, producto_id))
                    productos_actualizados += 1
        
        if productos_actualizados > 0:
            conn.commit()
            print(f"\n✅ Stock reiniciado para {productos_actualizados} productos")
        else:
            print("✅ El stock ya estaba correcto")
            
        print("\n📦 Stock actual de productos:")
        cursor.execute("SELECT id, nombre, existencia FROM producto LIMIT 10")
        for row in cursor.fetchall():
            print(f"  ID {row[0]}: {row[1][:30]:<30} Stock: {row[2]}")
            
        conn.close()
        
    except Exception as e:
        print(f"ERROR con la base de datos: {e}")

if __name__ == "__main__":
    print("🔄 Reiniciando stock de productos...")
    reset_stock()