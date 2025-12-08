"""Script para recrear la base de datos con stock inicial"""
from sqlmodel import Session, create_engine, SQLModel, select
from models.productos import Producto
from database import DB_PATH
import json
from pathlib import Path

# ======================================================
# 1) ELIMINAR BASE DE DATOS EXISTENTE
# ======================================================

if DB_PATH.exists():
    DB_PATH.unlink()
    print(f"✅ Base de datos eliminada: {DB_PATH}")

# ======================================================
# 2) CREAR ENGINE Y TABLAS
# ======================================================

engine = create_engine(f"sqlite:///{DB_PATH}", echo=True)

SQLModel.metadata.create_all(engine)
print("✅ Tablas creadas")

# ======================================================
# 3) CARGAR PRODUCTOS DESDE productos.json
# ======================================================

# Corrección: __file__
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

# ======================================================
# 4) MOSTRAR LOS PRIMEROS PRODUCTOS (VERIFICACIÓN)
# ======================================================

with Session(engine) as session:
    resultado = session.exec(select(Producto).limit(5))
    productos = resultado.all()

    print("\nPrimeros 5 productos:")
    for p in productos:
        print(f"  ID {p.id}: {p.nombre[:30]:<30} | Stock: {p.existencia} | ${p.precio}")

print("\n✅ Base de datos recreada exitosamente")
print("⚠ IMPORTANTE: Reinicia el servidor uvicorn para que use la nueva BD")
