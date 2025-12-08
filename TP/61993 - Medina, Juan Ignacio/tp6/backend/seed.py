import json
from pathlib import Path
from db import get_session, engine, create_db_and_tables
from models import Producto
from sqlmodel import Session, select

def seed_productos():
    ruta = Path(__file__).parent / "productos.json"
    if not ruta.exists():
        return
    with open(ruta, "r", encoding="utf-8") as f:
        data = json.load(f)
    create_db_and_tables()
    session = Session(engine)
    existing = session.exec(select(Producto)).first()
    if existing:
        return
    for p in data:
        prod = Producto(
            id=p.get("id"),
            nombre=p.get("titulo"),
            descripcion=p.get("descripcion"),
            precio=p.get("precio"),
            categoria=p.get("categoria"),
            existencia=p.get("existencia"),
            imagen=p.get("imagen")
        )
        session.add(prod)
    session.commit()

if __name__ == "__main__":
    seed_productos()
