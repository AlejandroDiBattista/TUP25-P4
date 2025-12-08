import json
import sys
from pathlib import Path
from sqlmodel import Session, select

# Asegurar que el directorio del backend esté en sys.path para imports relativos
BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.database import engine, create_db_and_tables as create_db
from models import Producto


def load_productos_file() -> list:
    ruta = Path(__file__).parent.parent / "productos.json"
    if not ruta.exists():
        raise FileNotFoundError(f"No se encontró productos.json en {ruta}")
    with open(ruta, "r", encoding="utf-8") as f:
        data = json.load(f)
    # aceptar formato {"value": [...]} o directamente una lista
    if isinstance(data, dict) and "value" in data:
        return data["value"]
    if isinstance(data, list):
        return data
    raise ValueError("Formato de productos.json no reconocido")


def seed():
    create_db()
    productos = load_productos_file()
    inserted = 0
    with Session(engine) as session:
        for item in productos:
            # si el producto ya existe por id, actualizar, sino insertar
            existing = session.exec(select(Producto).where(Producto.id == item.get("id"))).first()
            p = Producto(
                id=item.get("id"),
                titulo=item.get("titulo") or item.get("nombre") or "",
                precio=item.get("precio") or 0.0,
                descripcion=item.get("descripcion"),
                categoria=item.get("categoria"),
                valoracion=item.get("valoracion"),
                existencia=item.get("existencia") or item.get("stock") or 0,
                imagen=item.get("imagen"),
            )
            if existing:
                # actualizar campos
                existing.titulo = p.titulo
                existing.precio = p.precio
                existing.descripcion = p.descripcion
                existing.categoria = p.categoria
                existing.valoracion = p.valoracion
                existing.existencia = p.existencia
                existing.imagen = p.imagen
                session.add(existing)
            else:
                session.add(p)
                inserted += 1
        session.commit()

    print(f"Seed completado. Productos insertados: {inserted}")


if __name__ == "__main__":
    seed()
