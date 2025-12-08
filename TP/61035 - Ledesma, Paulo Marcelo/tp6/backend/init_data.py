from fastapi import FastAPI
from sqlmodel import SQLModel
from db import engine

from routers.auth import router as auth_router
from routers.productos import router as productos_router
from routers.carrito import router as carrito_router
from routers.compras import router as compras_router
from .producto import Producto
from .usuario import Usuario
from .carrito import Carrito, ItemCarrito
from .compra import Compra, ItemCompra

app = FastAPI(title="E-Commerce TP6")

# ✅ Crear tablas al iniciar
@app.on_event("startup")
def startup():
    SQLModel.metadata.create_all(engine)


# ✅ Registrar rutas
app.include_router(auth_router)
app.include_router(productos_router)
app.include_router(carrito_router)
app.include_router(compras_router)


@app.get("/")
def root():
    return {"message": "API funcionando correctamente"}
