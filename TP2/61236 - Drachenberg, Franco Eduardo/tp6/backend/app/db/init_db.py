import json
from pathlib import Path

from sqlmodel import Session, SQLModel, select

from app.db.session import get_engine
from app.models import Producto


def create_db_and_tables(engine=None) -> None:
    # Crear tablas si no existen
    resolved_engine = engine or get_engine()
    SQLModel.metadata.create_all(resolved_engine)
    load_initial_products(resolved_engine)


def load_initial_products(engine) -> None:
    # Productos iniciales
    with Session(engine) as session:
        existing = session.exec(select(Producto).limit(1)).first()
        if existing:
            return

        products_path = _resolve_products_path()
        products_data = _read_products_file(products_path)

        for entry in products_data:
            valoracion_raw = entry.get("valoracion")
            valoracion = float(valoracion_raw) if valoracion_raw is not None else None
            producto = Producto(
                id=entry.get("id"),
                nombre=str(entry.get("nombre") or entry.get("titulo") or "").strip(),
                descripcion=str(entry.get("descripcion") or ""),
                precio=float(entry.get("precio") or 0),
                categoria=str(entry.get("categoria") or ""),
                existencia=int(entry.get("existencia") or 0),
                valoracion=valoracion,
                imagen=str(entry.get("imagen")) if entry.get("imagen") else None,
            )
            session.add(producto)

        session.commit()


def _resolve_products_path() -> Path:
    base_dir = Path(__file__).resolve().parents[2]
    return base_dir / "productos.json"


def _read_products_file(path: Path) -> list[dict[str, object]]:
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    return data
