from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from db.database import create_db_and_tables, load_initial_data
from routers import auth, productos, carrito, compras


app = FastAPI(
    title="TP6 Shop API",
    description="API para tienda de comercio electrónico",
    version="1.0.0"
)

# Montar archivos estáticos
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar base de datos al startup
@app.on_event("startup")
def on_startup():
    print("=== Iniciando server ===")
    print("Creando tablas...")
    create_db_and_tables()
    print("Cargando datos iniciales...")
    try:
        load_initial_data()
        print("Datos iniciales cargados correctamente")
    except Exception as e:
        print(f"Error loading initial data: {e}")
        import traceback
        traceback.print_exc()

# Rutas de saludo
@app.get("/")
def root():
    return {
        "mensaje": "Bienvenido a TP6 Shop API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    """Endpoint de prueba"""
    return {"status": "ok"}

# Incluir routers
app.include_router(auth.router, tags=["Autenticación"])
app.include_router(productos.router, tags=["Productos"])
app.include_router(carrito.router, tags=["Carrito"])
app.include_router(compras.router, tags=["Compras"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)












