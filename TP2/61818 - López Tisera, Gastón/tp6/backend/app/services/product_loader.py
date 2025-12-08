import json
from pathlib import Path
from typing import Sequence

from sqlmodel import Session

from app.models.product import Product


def load_products_from_json(session: Session, json_path: Path) -> int:
    """Load products from JSON into the database if they don't exist yet."""
    if not json_path.exists():
        raise FileNotFoundError(f"No se encontró el archivo {json_path}")

    with open(json_path, "r", encoding="utf-8") as file:
        productos = json.load(file)

    existing = session.query(Product).count()
    if existing:
        return 0

    objects: Sequence[Product] = [
        Product(
            id=producto["id"],
            titulo=producto["titulo"],
            descripcion=producto["descripcion"],
            precio=producto["precio"],
            categoria=producto["categoria"],
            valoracion=producto["valoracion"],
            existencia=producto["existencia"],
            imagen=producto["imagen"],
        )
        for producto in productos
    ]
    session.add_all(objects)
    session.commit()
    return len(objects)

