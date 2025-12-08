from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.api import api_router
from app.core.config import get_settings
from app.db.session import get_session, init_db
from app.services.product_loader import load_products_from_json


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Application lifespan event used for startup tasks."""
    init_db()
    with next(get_session()) as session:
        productos_path = Path(__file__).resolve().parent.parent / "productos.json"
        load_products_from_json(session, productos_path)
    yield


def create_app() -> FastAPI:
    """Application factory."""
    settings = get_settings()
    app = FastAPI(
        title=settings.project_name,
        openapi_url=f"{settings.api_v1_prefix}/openapi.json",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.backend_cors_origins],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    images_dir = Path(__file__).resolve().parent.parent / "imagenes"
    if images_dir.exists():
        app.mount("/imagenes", StaticFiles(directory=images_dir), name="imagenes")

    app.include_router(api_router, prefix=settings.api_v1_prefix)

    @app.get("/", summary="Root endpoint")
    def read_root() -> dict[str, str]:
        return {"message": "API e-commerce TP6 - revise /docs para la documentación."}

    return app

