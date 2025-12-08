from sqlmodel import SQLModel, create_engine, Session
from sqlmodel import select
import json
from pathlib import Path
from typing import Generator

DATABASE_URL = "sqlite:///./ecommerce.db"

engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


def init_db(load_products: bool = True):
    # Create database and tables
    SQLModel.metadata.create_all(engine)

    if load_products:
        # Try to load productos.json at repo root or same folder
        candidates = [Path("productos.json"), Path(__file__).parent.parent / "productos.json"]
        for p in candidates:
            if p.exists():
                try:
                    from core_models import Product
                    with open(p, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        with Session(engine) as session:
                            # Ensure `imagen` column exists (for SQLite add column if missing)
                            try:
                                with engine.connect() as conn:
                                    cols = conn.exec("PRAGMA table_info(product)").all()
                                    col_names = [c[1] for c in cols]
                                    if 'imagen' not in col_names:
                                        # Add column 'imagen' as TEXT
                                        conn.exec("ALTER TABLE product ADD COLUMN imagen TEXT")
                            except Exception:
                                # Ignore if pragma/alter not supported in this environment
                                pass

                            for item in data:
                                # Support files that use either "nombre" or "titulo" for the product name
                                name = item.get("nombre") or item.get("titulo") or ""
                                # Only add if not exists (by nombre/title)
                                stmt = select(Product).where(Product.nombre == name)
                                result = session.exec(stmt).first()
                                imagen_path = item.get("imagen") or item.get("image") or None
                                if result is None:
                                    prod = Product(
                                        nombre=name,
                                        descripcion=item.get("descripcion", ""),
                                        precio=float(item.get("precio", 0)),
                                        categoria=item.get("categoria", ""),
                                        existencia=int(item.get("existencia", 0)),
                                        imagen=imagen_path,
                                    )
                                    session.add(prod)
                                else:
                                    # If product exists but imagen missing, try to update it
                                    if imagen_path and (not getattr(result, 'imagen', None)):
                                        result.imagen = imagen_path
                                        session.add(result)
                            session.commit()
                    break
                except Exception:
                    # If products file malformed or models import fails, skip
                    break
