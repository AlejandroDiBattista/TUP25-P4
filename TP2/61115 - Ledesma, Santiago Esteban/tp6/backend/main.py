from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import SQLModel
from db import engine

# ✅ Importar modelos (asegura que las tablas existan)
from models import Producto, Usuario, Carrito, ItemCarrito, Compra, ItemCompra

# ✅ Importar routers
from routers.auth import router as auth_router
from routers.carrito import router as carrito_router
from routers.compras import router as compras_router
from routers.productos import router as productos_router

# ✅ Crear instancia de la app
app = FastAPI(title="E-Commerce FastAPI")

# ✅ Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Crear tablas automáticamente al iniciar
@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

# ✅ Registrar routers
app.include_router(auth_router)
app.include_router(productos_router)
app.include_router(carrito_router)
app.include_router(compras_router)

# ✅ Servir imágenes estáticas
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

@app.get("/")
def root():
    return {"mensaje": "API de E-Commerce funcionando correctamente 🚀"}
