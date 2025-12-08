from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json
from pathlib import Path
from database import create_db_and_tables, engine
from models import Usuario, Producto, Carrito, ItemCarrito, Compra, ItemCompra
from routes import auth_router, productos_router, carrito_router, compras_router
from sqlmodel import Session

app = FastAPI(title="API Venti Indumentaria")

# Configurar CORS PRIMERO (antes que las rutas)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear las tablas de la base de datos al iniciar
@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    print("✓ Base de datos iniciada correctamente")

# Montar directorio de imágenes como archivos estáticos
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

# Incluir rutas
app.include_router(auth_router)
app.include_router(productos_router)
app.include_router(carrito_router)
app.include_router(compras_router)

@app.get("/")
def root():
    return {"mensaje": "API de Venti Indumentaria - use /api/productos para obtener el listado"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
