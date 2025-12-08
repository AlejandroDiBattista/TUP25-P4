import sqlite3
from pathlib import Path

def check_database():
    """Verifica las tablas y estructura de la base de datos"""
    backend_dir = Path(__file__).parent
    db_path = backend_dir / "database.db"
    
    if not db_path.exists():
        print(f"❌ Base de datos no encontrada: {db_path}")
        return
        
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print("📋 Tablas en la base de datos:")
        for table in tables:
            print(f"  - {table[0]}")
            
        for table in tables:
            table_name = table[0]
            if 'producto' in table_name.lower():
                print(f"\n🏗️ Esquema de la tabla '{table_name}':")
                cursor.execute(f"PRAGMA table_info({table_name})")
                columns = cursor.fetchall()
                for col in columns:
                    print(f"  - {col[1]} ({col[2]})")
                    
                print(f"\n📊 Primeros registros de '{table_name}':")
                cursor.execute(f"SELECT * FROM {table_name} LIMIT 5")
                rows = cursor.fetchall()
                for row in rows:
                    print(f"  {row}")
        
        conn.close()
        
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    check_database()