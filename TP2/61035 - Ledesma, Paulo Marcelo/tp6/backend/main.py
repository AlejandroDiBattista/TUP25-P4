from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import SQLModel, Session, select
from db import engine, get_session
import unicodedata

# ✅ Importar modelos (IMPORTANTE para que SQLModel registre las tablas)
from models import Producto, Usuario, Carrito, ItemCarrito, Compra, ItemCompra

# ✅ Importar routers
from routers.auth import router as auth_router
from routers.carrito import router as carrito_router
from routers.compras import router as compras_router
from routers.productos import router as productos_router

# ✅ Crear app (SE HACE ANTES DE INCLUDE_ROUTER)
app = FastAPI(title="E-Commerce FastAPI")

# ✅ Registrar routers (recién después de crear app)
app.include_router(auth_router)
app.include_router(productos_router)
app.include_router(carrito_router)
app.include_router(compras_router)

# ✅ Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Crear tablas al iniciar
@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

# ✅ Servir imágenes estáticas
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

@app.get("/")
def root():
    return {"mensaje": "API de E-Commerce funcionando correctamente 🚀"}
