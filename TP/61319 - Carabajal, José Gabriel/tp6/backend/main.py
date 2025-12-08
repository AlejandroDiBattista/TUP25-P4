from fastapi import FastAPI, Query, Response
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Optional, Dict, Any, List

from db import create_db_and_tables

from models import carrito as _carrito_models  
from models import compras as _compras_models  

# Routers
from routers import auth as auth_router
from routers import carrito as carrito_router
from routers import compras as compras_router

# Utilidades de productos/stock
from utils.products import listar_productos

app = FastAPI(title="TP6 Shop API")

# Archivos estáticos (imágenes de productos)
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

# CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Eventos de app ----------
@app.on_event("startup")
def on_startup() -> None:
    # Crea las tablas si no existen
    create_db_and_tables()

# ---------- Rutas base ----------
@app.get("/")
def root() -> Dict[str, str]:
    return {"mensaje": "API de Productos - use /productos para obtener el listado"}

@app.get("/productos")
def obtener_productos(
    response: Response,
    search: Optional[str] = Query(None, description="Texto a buscar en título o descripción"),
    categoria: Optional[str] = Query(None, description="Categoría exacta (ej: 'Ropa de hombre')")
) -> List[Dict[str, Any]]:
    """
    Devuelve los productos combinando productos.json + stock.json,
    de modo que 'existencia' siempre refleje el stock REAL.
    Además desactiva cache para que el frontend vea los cambios al instante.
    """
    # Desactivar cache del listado 
    response.headers["Cache-Control"] = "no-store"

    productos = listar_productos()  

    # Filtro por texto 
    if search:
        s = search.lower()
        productos = [
            p for p in productos
            if s in p["titulo"].lower() or s in p["descripcion"].lower()
        ]

    # Filtro por categoría 
    if categoria and categoria.lower() != "todas":
        productos = [p for p in productos if p["categoria"].lower() == categoria.lower()]

    return productos

@app.get("/productos/{producto_id}")
def obtener_producto_por_id(producto_id: int, response: Response) -> Dict[str, Any]:
    """
    Devuelve un producto por ID, combinando productos.json + stock.json
    para que 'existencia' refleje el stock real.
    """
    # Evitar cache para ver stock actualizado al instante
    response.headers["Cache-Control"] = "no-store"

    productos = listar_productos()  
    for p in productos:
        if int(p["id"]) == int(producto_id):
            return p

    raise HTTPException(status_code=404, detail="Producto no encontrado")


# ---------- Routers ----------
app.include_router(auth_router.router, tags=["auth"])
app.include_router(carrito_router.router, tags=["carrito"])
app.include_router(compras_router.router, tags=["compras"])

# ---------- Modo script ----------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
