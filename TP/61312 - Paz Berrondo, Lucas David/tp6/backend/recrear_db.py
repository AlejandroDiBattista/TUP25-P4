"""Script para recrear la base de datos con stock inicial"""
from sqlmodel import Session, create_engine, SQLModel
from models.productos import Usuario, Producto, Carrito, ItemCarrito, Compra, ItemCompra
from database import DB_PATH
import json
from pathlib import Path

# Eliminar BD existente
if DB_PATH.exists():
    DB_PATH.unlink()
    print(f"✅ Base de datos eliminada: {DB_PATH}")

# Crear engine nuevo
engine = create_engine(f"sqlite:///{DB_PATH}", echo=True)

# Crear tablas
SQLModel.metadata.create_all(engine)
print("✅ Tablas creadas")

# Cargar productos
ruta_productos = Path(__file__).parent / "productos.json"
with open(ruta_productos, "r", encoding="utf-8") as archivo:
    productos_json = json.load(archivo)

with Session(engine) as session:
    for producto_data in productos_json:
        producto = Producto(
            id=producto_data["id"],
            nombre=producto_data["titulo"],
            descripcion=producto_data["descripcion"],
            precio=producto_data["precio"],
            categoria=producto_data["categoria"],
            existencia=producto_data["existencia"],
            imagen=producto_data["imagen"]
        )
        session.add(producto)
    
    session.commit()
    print(f"✅ {len(productos_json)} productos cargados")

# Verificar
with Session(engine) as session:
    productos = session.query(Producto).limit(5).all()
    print("\nPrimeros 5 productos:")
    for p in productos:
        print(f"  ID {p.id}: {p.nombre[:30]:<30} | Stock: {p.existencia} | ${p.precio}")

print("\n✅ Base de datos recreada exitosamente")
print("⚠️  IMPORTANTE: Reinicia el servidor uvicorn para que use la nueva BD")
