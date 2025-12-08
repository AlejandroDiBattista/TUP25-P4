"""Script to load productos.json into SQLite DB using SQLModel models."""
import json
from pathlib import Path
from app.db import init_db, engine
from app.models import Product
from sqlmodel import Session


def load_products():
    base = Path(__file__).parent
    ruta = base / "productos.json"
    if not ruta.exists():
        print("productos.json no encontrado")
        return
    with open(ruta, "r", encoding="utf-8") as f:
        data = json.load(f)

    init_db()
    with Session(engine) as session:
        for p in data:
            prod = Product(
                id=p.get("id"),
                nombre=p.get("titulo") or p.get("nombre"),
                descripcion=p.get("descripcion"),
                precio=p.get("precio", 0.0),
                categoria=p.get("categoria"),
                existencia=p.get("existencia", 0),
                imagen=p.get("imagen"),
            )
            session.merge(prod)
        session.commit()
    print("Carga inicial completada")


if __name__ == "__main__":
    load_products()
