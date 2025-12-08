from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import engine, init_db
from routers import auth, productos, carrito, compras

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializar base de datos al iniciar
    init_db()
    yield
    # Código de limpieza si es necesario

app = FastAPI(
    title="E-commerce API",
    description="API RESTful para sitio de comercio electrónico",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js por defecto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router, prefix="/api", tags=["Autenticación"])
app.include_router(productos.router, prefix="/api", tags=["Productos"])
app.include_router(carrito.router, prefix="/api", tags=["Carrito"])
app.include_router(compras.router, prefix="/api", tags=["Compras"])

@app.get("/")
async def root():
    return {"message": "E-commerce API"}

