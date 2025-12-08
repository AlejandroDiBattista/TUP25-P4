# ...existing code...
import os
import traceback
import logging

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from routers import users
from routers import products
from routers import cart
from routers import purchases
from db import init_db
from fastapi.middleware.cors import CORSMiddleware

import uvicorn

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("ecommerce-api")

logger.info("✅ Iniciando app FastAPI...")

app = FastAPI(title="API E-commerce", version="1.0")

# Servir imágenes estáticas desde la carpeta `imagenes`
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

# Configurar CORS: por defecto permitimos puertos comunes en dev.
default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
env_origins = os.getenv("FRONTEND_ORIGINS")
if env_origins:
    allow_origins = [o.strip() for o in env_origins.split(",") if o.strip()]
else:
    allow_origins = default_origins

# Para desarrollo rápido: permite todo si se setea ALLOW_ALL_ORIGINS=1
if os.getenv("ALLOW_ALL_ORIGINS", "0") == "1":
    allow_origins = ["*"]
    logger.warning("⚠️ ALLOW_ALL_ORIGINS=1 -> CORS configurado a '*' (solo para desarrollo)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("📦 Incluyendo routers...")
app.include_router(users.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(purchases.router)
logger.info("✅ Routers incluidos correctamente")


@app.on_event("startup")
def on_startup():
    # Initialize DB and optionally load producto.json con manejo de errores
    try:
        init_db(load_products=True)
        logger.info("✅ Base de datos inicializada correctamente")
    except Exception:
        logger.exception("❌ Error inicializando la base de datos:")
        # no re-raise para que la app se levante e inspecciones logs; puedes cambiar esto si prefieres fallo duro.


@app.get("/")
def root():
    return {"message": "Bienvenido a la API del E-commerce"}


if __name__ == "__main__":
    # Permite arrancar con: python main.py
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
# ...existing code...