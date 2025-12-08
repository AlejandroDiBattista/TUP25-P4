
import json
from pathlib import Path

from sqlmodel import Session, select

from .models import Articulo


def cargar_productos_iniciales(session: Session, ruta: str = "productos.json") -> None:
    """Carga productos desde productos.json si la tabla está vacía."""
    hay_articulos = session.exec(select(Articulo)).first()
    if hay_articulos:
        return

    path = Path(ruta)
    if not path.exists():
        return

    data = json.loads(path.read_text(encoding="utf-8"))

    for p in data:
        titulo = p.get("title") or p.get("titulo")
        descripcion = p.get("description") or p.get("descripcion", "")
        precio = float(p.get("price") or p.get("precio", 0))
        categoria = p.get("category") or p.get("categoria", "otros")
        imagen = p.get("image") or p.get("imagen", "")
        existencias = int(p.get("rating", {}).get("count", 5))
        es_electronico = "electr" in categoria.lower()

        articulo = Articulo(
            titulo=titulo,
            descripcion=descripcion,
            precio=precio,
            categoria=categoria,
            imagen=imagen,
            existencias=existencias,
            es_electronico=es_electronico,
        )
        session.add(articulo)

    session.commit()
