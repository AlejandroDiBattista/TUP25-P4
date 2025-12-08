from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from contextlib import asynccontextmanager
import json

from app.routers import auth, productos, carrito, compras
from app.database import create_db_and_tables, get_session
from app.models.productos import Producto
from sqlmodel import select

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Inicializa la base de datos al arrancar el servidor"""
    create_db_and_tables()
    
    # Cargar productos si la BD está vacía
    session_gen = get_session()
    session = next(session_gen)
    try:
        existing_products = session.exec(select(Producto)).all()
        if len(existing_products) == 0:
            json_path = Path(__file__).parent / "data" / "productos.json"
            if json_path.exists():
                with open(json_path, "r", encoding="utf-8") as archivo:
                    productos_data = json.load(archivo)
                
                for producto_data in productos_data:
                    imagen_path = producto_data["imagen"]
                    if imagen_path.startswith("imagenes/"):
                        imagen_path = imagen_path.replace("imagenes/", "")
                    
                    producto = Producto(
                        id=producto_data["id"],
                        nombre=producto_data["titulo"],
                        precio=producto_data["precio"],
                        descripcion=producto_data["descripcion"],
                        categoria=producto_data["categoria"],
                        imagen=imagen_path,
                        existencia=producto_data["existencia"]
                    )
                    session.add(producto)
                
                session.commit()
    except Exception as e:
        session.rollback()
    finally:
        session.close()
    
    yield

app = FastAPI(title="API Polirubro", lifespan=lifespan)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ruta base absoluta (app/)
BASE_DIR = Path(__file__).resolve().parent

# Montar carpeta de imágenes
app.mount(
    "/imagenes",
    StaticFiles(directory=BASE_DIR / "imagenes"),
    name="imagenes"
)

# Registrar routers
app.include_router(auth.router, prefix="/auth", tags=["Autenticación"])
app.include_router(productos.router, prefix="/productos", tags=["Productos"])
app.include_router(carrito.router, prefix="/carrito", tags=["Carrito"])
app.include_router(compras.router, prefix="/compras", tags=["Compras"])

@app.get("/")
def root():
    return {"mensaje": "API del Polirubro - FastAPI funcionando correctamente 🚀"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
