from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from db import create_db_and_tables
from seed import seed_productos
from routes import auth as auth_router
from routes import productos as productos_router
from routes import carrito as carrito_router
from routes import compras as compras_router

app = FastAPI(title="TP6 - API")

app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="", tags=["auth"])
app.include_router(productos_router.router, prefix="/productos", tags=["productos"])
app.include_router(carrito_router.router, prefix="/carrito", tags=["carrito"])
app.include_router(compras_router.router, prefix="/compras", tags=["compras"])

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    seed_productos()
