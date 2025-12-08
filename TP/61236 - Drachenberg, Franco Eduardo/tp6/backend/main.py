from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.db.init_db import create_db_and_tables
from app.db.session import get_engine
from app.routers.auth import router as auth_router
from app.routers.carrito import router as carrito_router
from app.routers.compras import router as compras_router
from app.routers.productos import router as productos_router


app = FastAPI(title="API Productos")


@app.on_event("startup")
def startup_event() -> None:
    engine = get_engine()
    create_db_and_tables(engine)


# Montar directorio de imágenes como archivos estáticos
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"mensaje": "API de Productos - use /productos para obtener el listado"}


app.include_router(auth_router)
app.include_router(carrito_router)
app.include_router(compras_router)
app.include_router(productos_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
