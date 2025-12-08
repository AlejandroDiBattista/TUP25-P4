from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from models.database import init_db
from models.cargar_datos import cargar_productos_iniciales

# Importar routers
from models.auth import router as auth_router
from models.carrito_routes import router as carrito_router
from models.compras_routes import router as compras_router
from models.productos_routes import router as productos_router  # <-- IMPORTANTE

app = FastAPI(title="TP6 Shop API")

# Servir imágenes estáticas para los productos
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Si tu frontend está en Vite, dejar así
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"mensaje": "API de la tienda funcionando"}

# Inicializar base + cargar productos al iniciar
init_db()
cargar_productos_iniciales()

# Registrar routers
app.include_router(auth_router)
app.include_router(productos_router)   # <-- AHORA SÍ
app.include_router(carrito_router)
app.include_router(compras_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
