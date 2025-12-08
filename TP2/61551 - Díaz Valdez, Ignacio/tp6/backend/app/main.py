from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import create_db_and_tables, get_session
from .routers import auth, productos, carrito, compras
from models import Producto
from sqlmodel import select
from sqlalchemy import func
from pathlib import Path
import json

create_db_and_tables()  # FASE 1: crear tablas al iniciar

app = FastAPI(title="API Productos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # FASE 1: restringido al frontend local
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static images (optional if used from backend)
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

# Routers
app.include_router(auth.router)
app.include_router(productos.router)
app.include_router(carrito.router)
app.include_router(compras.router)

@app.get("/healthz")
def healthz():
    return "ok"

@app.get("/")
def root():
    return {"mensaje": "API de Productos"}


@app.on_event("startup")
def seed_products_if_empty():
    try:
        with get_session() as session:
            count = session.exec(select(func.count(Producto.id))).one()
            if count and int(count) > 0:
                return
            productos_json = Path(__file__).resolve().parent.parent / "productos.json"
            if not productos_json.exists():
                return
            with open(productos_json, "r", encoding="utf-8") as f:
                data = json.load(f)
            items = data.get("value", data) if isinstance(data, dict) else data
            if not isinstance(items, list):
                return
            for item in items:
                p = Producto(
                    id=item.get("id"),
                    titulo=item.get("titulo") or item.get("nombre") or "",
                    precio=item.get("precio") or 0.0,
                    descripcion=item.get("descripcion") or "",
                    categoria=item.get("categoria") or "",
                    valoracion=item.get("valoracion"),
                    existencia=item.get("existencia") or item.get("stock") or 0,
                    imagen=item.get("imagen"),
                )
                session.add(p)
            session.commit()
    except Exception:
        # No bloquear el arranque si el seed falla; el router usa fallback al JSON.
        pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
