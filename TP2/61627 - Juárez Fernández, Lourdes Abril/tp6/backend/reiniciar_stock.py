"""Script para reiniciar el stock directamente en SQLite"""

import sqlite3
import json
from pathlib import Path

def reiniciar_stock():
    """Reinicia el stock de todos los productos desde productos.json"""
    
    backend_dir = Path(__file__).parent
    db_path = backend_dir / "tp6.db"
    productos_json_path = backend_dir / "productos.json"
    
    if not productos_json_path.exists():
        print(f"❌ No se encontró {productos_json_path}")
        return
    
    try:
        with open(productos_json_path, "r", encoding="utf-8") as f:
            datos_productos = json.load(f)
    except Exception as e:
        print(f"❌ Error leyendo productos.json: {e}")
        return
    
    if not db_path.exists():
        print(f"❌ No se encontró la base de datos: {db_path}")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='producto';")
        if not cursor.fetchone():
            print("❌ Tabla 'producto' no encontrada en la base de datos")
            return
        
        productos_actualizados = 0
        productos_json_por_id = {p["id"]: p for p in datos_productos}
        
        cursor.execute("SELECT id, nombre, existencia FROM producto")
        productos_db = cursor.fetchall()
        
        print("📦 Actualizando stock...")
        
        for producto_db in productos_db:
            producto_id, nombre, existencia_actual = producto_db
            
            if producto_id in productos_json_por_id:
                producto_json = productos_json_por_id[producto_id]
                stock_original = producto_json.get("existencia", 5)
                
                if existencia_actual != stock_original:
                    print(f"  ID {producto_id} ({nombre[:30]}): {existencia_actual} → {stock_original}")
                    cursor.execute("UPDATE producto SET existencia = ? WHERE id = ?", (stock_original, producto_id))
                    productos_actualizados += 1
        
        if productos_actualizados > 0:
            conn.commit()
            print(f"\n✅ Stock actualizado para {productos_actualizados} productos")
        else:
            print("✅ El stock ya estaba correcto")
        
        print("\n📋 Estado final del stock:")
        cursor.execute("SELECT id, nombre, existencia FROM producto ORDER BY id LIMIT 10")
        for row in cursor.fetchall():
            producto_id, nombre, existencia = row
            color_emoji = "🟢" if existencia > 0 else "🔴"
            print(f"  {color_emoji} ID {producto_id}: {nombre[:30]:<30} Stock: {existencia}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error con la base de datos: {e}")

if __name__ == "__main__":
    print("🔄 Reiniciando stock de productos...")
    reiniciar_stock()
    print("\n🎯 Ahora puedes agregar productos al carrito sin problemas de stock!")