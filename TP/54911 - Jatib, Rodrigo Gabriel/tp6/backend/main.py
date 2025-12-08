import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.config import settings
from app.db import init_db
from app.routers.admin_router import router as admin_router
from app.routers.auth_router import router as auth_router
from app.routers.carrito_router import router as carrito_router
from app.routers.compat_router import router as compat_router
from app.routers.compras_router import router as compras_router
from app.routers.productos_router import router as productos_router


# Configure logging level early from settings so uvicorn logs follow LOG_LEVEL
level = getattr(logging, settings.LOG_LEVEL, logging.INFO)
logging.basicConfig(level=level)
logging.getLogger("uvicorn").setLevel(level)
logging.getLogger("uvicorn.error").setLevel(level)
logging.getLogger("uvicorn.access").setLevel(level)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.getLogger("uvicorn").info(
        "Starting app ENV=%s ALLOW_ORIGINS=%s",
        getattr(settings, "ENV", "development"),
        settings.ALLOW_ORIGINS,
    )
    init_db()
    yield


app = FastAPI(title="API Comercio - Backend", lifespan=lifespan)


imagenes_dir = Path(__file__).resolve().parent / "imagenes"
if imagenes_dir.exists():
    app.mount("/imagenes", StaticFiles(directory=str(imagenes_dir)), name="imagenes")
else:
    logging.getLogger("uvicorn").warning("Imagenes directory not found at %s", imagenes_dir)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"mensaje": "API Comercio - usar /productos y /auth"}


app.include_router(auth_router)
app.include_router(productos_router)
app.include_router(carrito_router)
app.include_router(compras_router)
app.include_router(compat_router)
app.include_router(admin_router)


@app.get("/health")
def health():
    try:
        from app.db import engine

        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return JSONResponse(status_code=200, content={"status": "ok"})
    except Exception as exc:  # pragma: no cover - defensive path
        return JSONResponse(status_code=500, content={"status": "error", "details": str(exc)})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
