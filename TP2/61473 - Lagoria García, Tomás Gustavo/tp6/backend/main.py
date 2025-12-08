from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select
from pathlib import Path
import unicodedata

from database import crear_tablas, get_session
from models import Producto, ProductoResponse
from routers import auth, carrito, compras

app = FastAPI(
    title="API E-Commerce",
    description="API para e-commerce con autenticación y carrito de compras",
    version="1.0.0"
)

# Incluir routers
app.include_router(auth.router)
app.include_router(carrito.router)
app.include_router(compras.router)

# Montar directorio de imágenes como archivos estáticos
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción especificar dominios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== EVENTOS ====================

def normalizar_texto(texto: str) -> str:
    """Normaliza texto removiendo acentos y convirtiéndolo a minúsculas."""
    # Descomponer caracteres acentuados (ó -> o + acento)
    texto_nfd = unicodedata.normalize('NFD', texto)
    # Filtrar solo caracteres que no sean marcas diacríticas
    texto_sin_acentos = ''.join(char for char in texto_nfd if unicodedata.category(char) != 'Mn')
    return texto_sin_acentos.lower()


@app.on_event("startup")
def on_startup():
    """Se ejecuta al iniciar la aplicación."""
    crear_tablas()
    print("\n" + "="*60)
    print("✅ Servidor iniciado correctamente")
    print("🌐 Escuchando en: http://localhost:8000")
    print("📚 Documentación: http://localhost:8000/docs")
    print("="*60 + "\n")


# ==================== ENDPOINTS ====================

@app.get("/")
def root():
    return {
        "mensaje": "API E-Commerce - Trabajo Práctico 6",
        "version": "1.0.0",
        "endpoints": {
            "productos": "/productos",
            "docs": "/docs"
        }
    }


@app.get("/productos", response_model=list[ProductoResponse])
def obtener_productos(
    session: Session = Depends(get_session),
    categoria: str | None = None,
    busqueda: str | None = None
):
    """
    Obtiene la lista de productos.
    
    - **categoria**: Filtrar por categoría (opcional)
    - **busqueda**: Buscar en título y descripción (opcional)
    """
    # Query base
    query = select(Producto)
    
    # Filtrar por categoría si se especifica (case-insensitive)
    if categoria:
        query = query.where(Producto.categoria.ilike(categoria))
    
    # Buscar en título, descripción y categoría si se especifica (sin acentos)
    if busqueda:
        # Obtener todos los productos y filtrar en memoria para ignorar acentos
        productos_temp = session.exec(query).all()
        busqueda_normalizada = normalizar_texto(busqueda)
        
        productos = [
            p for p in productos_temp
            if busqueda_normalizada in normalizar_texto(p.titulo) or
               busqueda_normalizada in normalizar_texto(p.descripcion) or
               busqueda_normalizada in normalizar_texto(p.categoria)
        ]
    else:
        productos = session.exec(query).all()
    
    # Convertir a response model con propiedad disponible
    return [
        ProductoResponse(
            id=p.id,
            titulo=p.titulo,
            descripcion=p.descripcion,
            precio=p.precio,
            categoria=p.categoria,
            valoracion=p.valoracion,
            existencia=p.existencia,
            imagen=p.imagen,
            disponible=p.disponible
        )
        for p in productos
    ]


@app.get("/productos/{producto_id}", response_model=ProductoResponse)
def obtener_producto(
    producto_id: int,
    session: Session = Depends(get_session)
):
    """Obtiene los detalles de un producto específico."""
    producto = session.get(Producto, producto_id)
    
    if not producto:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    return ProductoResponse(
        id=producto.id,
        titulo=producto.titulo,
        descripcion=producto.descripcion,
        precio=producto.precio,
        categoria=producto.categoria,
        valoracion=producto.valoracion,
        existencia=producto.existencia,
        imagen=producto.imagen,
        disponible=producto.disponible
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
