"""
Script para cargar productos iniciales desde productos.json
"""
import json
from pathlib import Path
from sqlmodel import Session, select
from database import engine, init_db
from models import Producto

def load_products():
    """Cargar productos desde productos.json"""
    # Inicializar base de datos
    init_db()
    
    # Obtener la ruta del archivo productos.json (en el directorio raíz del proyecto)
    script_dir = Path(__file__).parent  # backend/
    project_root = script_dir.parent     # raíz del proyecto
    productos_path = project_root / "productos.json"
    
    # Leer productos.json
    try:
        with open(productos_path, "r", encoding="utf-8") as f:
            productos_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: No se encontró el archivo productos.json en {productos_path}")
        return
    
    with Session(engine) as session:
        # Verificar si ya hay productos
        statement = select(Producto)
        existing = session.exec(statement).first()
        if existing:
            print("Ya existen productos en la base de datos. ¿Desea continuar? (s/n)")
            respuesta = input().lower()
            if respuesta != 's':
                print("Operación cancelada")
                return
        
        # Cargar productos
        for producto_data in productos_data:
            # Verificar si el producto ya existe
            statement = select(Producto).where(Producto.nombre == producto_data["nombre"])
            existing = session.exec(statement).first()
            if existing:
                print(f"Producto '{producto_data['nombre']}' ya existe, omitiendo...")
                continue
            
            producto = Producto(
                nombre=producto_data["nombre"],
                descripcion=producto_data.get("descripcion", ""),
                precio=float(producto_data["precio"]),
                categoria=producto_data["categoria"],
                existencia=int(producto_data.get("existencia", 0))
            )
            session.add(producto)
            print(f"Agregado: {producto.nombre}")
        
        session.commit()
        print(f"\n✓ Se cargaron {len(productos_data)} productos exitosamente")

if __name__ == "__main__":
    load_products()

