from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.database import create_db_and_tables
from backend.routers import auth, productos, carrito, ventas

app = FastAPI(title="API Productos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# RUTA CORRECTA
app.mount("/imagenes", StaticFiles(directory="backend/imagenes"), name="imagenes")

@app.on_event("startup")
def startup():
    create_db_and_tables()

app.include_router(auth.router)
app.include_router(productos.router)
app.include_router(carrito.router)
app.include_router(ventas.router)

@app.get("/")
def root():
    return {"mensaje": "API funcionando"}
