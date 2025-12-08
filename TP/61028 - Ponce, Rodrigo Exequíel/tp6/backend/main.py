from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordRequestForm
import json
from pathlib import Path
from datetime import timedelta
from sqlmodel import Session, select
from models.database import create_db_and_tables, engine, get_session
from models.models import Usuario, Producto
from typing import List, Optional
from schemas.producto_schema import ProductoResponse, ProductoFilter
from services.producto_service import ProductoService
from auth.schemas import UsuarioCreate, Token, UsuarioResponse
from auth.security import (
    get_password_hash,
    crear_token_acceso,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_usuario_actual,
    verificar_password
)
# --- ¡AQUÍ ESTÁ LA PRIMERA CORRECCIÓN! ---
from schemas.carrito_schema import (
    ItemCarritoCreate,
    ItemCarritoUpdate,
    CarritoResponse,
    ItemCarritoResponse,
    ItemCarritoSimpleResponse  # <-- 1. Importamos el nuevo schema simple
)
# ---
from services.carrito_service import CarritoService
from schemas.compra_schema import CompraCreate, CompraResponse, CompraResumenResponse
from services.compra_service import CompraService

app = FastAPI(title="Tienda API")

# Montar directorio de imágenes como archivos estáticos
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

# Configuración de CORS (ya estaba correcta)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*", "Authorization", "Content-Type"],
)

@app.on_event("startup")
async def startup_event():
    create_db_and_tables()

# --- Endpoints de Autenticación ---

@app.post("/registrar", response_model=UsuarioResponse, tags=["Autenticación"])
async def registrar_usuario(
    usuario: UsuarioCreate, 
    session: Session = Depends(get_session)
):
    existe = session.exec(
        select(Usuario).where(Usuario.email == usuario.email)
    ).first()
    if existe:
        raise HTTPException(
            status_code=400,
            detail="El email ya está registrado"
        )
    
    nuevo_usuario = Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        password_hash=get_password_hash(usuario.password)
    )
    session.add(nuevo_usuario)
    session.commit()
    session.refresh(nuevo_usuario)
    
    return nuevo_usuario

@app.post("/iniciar-sesion", response_model=Token, tags=["Autenticación"])
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    usuario = session.exec(
        select(Usuario).where(Usuario.email == form_data.username)
    ).first()
    if not usuario or not verificar_password(form_data.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = crear_token_acceso(
        data={"sub": usuario.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/cerrar-sesion", tags=["Autenticación"])
async def cerrar_sesion(usuario_actual: Usuario = Depends(get_usuario_actual)):
    return {"mensaje": "Sesión cerrada exitosamente"}

@app.get("/me", response_model=UsuarioResponse, tags=["Autenticación"])
async def obtener_usuario_actual(usuario_actual: Usuario = Depends(get_usuario_actual)):
    return usuario_actual

@app.get("/")
def root():
    return {"mensaje": "API de la Tienda - Bienvenido"}

# --- Endpoints de Productos ---

@app.get("/productos", response_model=List[ProductoResponse], tags=["Productos"])
async def obtener_productos(
    filtros: ProductoFilter = Depends(),
    session: Session = Depends(get_session)
):
    await ProductoService.cargar_productos_iniciales(session)
    return await ProductoService.obtener_productos(session, filtros)

@app.get("/productos/{producto_id}", response_model=ProductoResponse, tags=["Productos"])
async def obtener_producto(
    producto_id: int,
    session: Session = Depends(get_session)
):
    producto = await ProductoService.obtener_producto(session, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

@app.get("/categorias", response_model=List[str], tags=["Productos"])
async def obtener_categorias(session: Session = Depends(get_session)):
    await ProductoService.cargar_productos_iniciales(session)
    return await ProductoService.obtener_categorias(session)

# --- Endpoints del Carrito (Commit 4) ---

@app.get("/carrito", response_model=CarritoResponse, tags=["Carrito"])
async def obtener_carrito(
    usuario: Usuario = Depends(get_usuario_actual),
    session: Session = Depends(get_session)
):
    return await CarritoService.obtener_carrito(session, usuario)

# --- ¡AQUÍ ESTÁ LA SEGUNDA CORRECCIÓN! ---
@app.post(
    "/carrito",
    response_model=ItemCarritoSimpleResponse, # <-- 2. Cambiamos al schema simple
    status_code=status.HTTP_201_CREATED, 
    tags=["Carrito"]
)
async def agregar_al_carrito(
    item: ItemCarritoCreate,
    usuario: Usuario = Depends(get_usuario_actual),
    session: Session = Depends(get_session)
):
    # Esta función devuelve un ItemCarrito (simple), que ahora SÍ coincide
    # con el response_model 'ItemCarritoSimpleResponse'.
    return await CarritoService.agregar_producto(
        session, 
        usuario, 
        item.producto_id, 
        item.cantidad
    )
# ---

@app.delete(
    "/carrito/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT, 
    tags=["Carrito"]
)
async def quitar_del_carrito(
    producto_id: int,
    usuario: Usuario = Depends(get_usuario_actual),
    session: Session = Depends(get_session)
):
    exito = await CarritoService.quitar_producto(session, usuario, producto_id)
    if not exito:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Producto no encontrado en el carrito"
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@app.put(
    "/carrito/{producto_id}",
    response_model=ItemCarritoResponse, # <-- Este (PUT) puede seguir usando el complejo
    tags=["Carrito"]
)
async def actualizar_cantidad_carrito(
    producto_id: int,
    item: ItemCarritoUpdate,
    usuario: Usuario = Depends(get_usuario_actual),
    session: Session = Depends(get_session)
):
    return await CarritoService.actualizar_cantidad(
        session, 
        usuario, 
        producto_id, 
        item.cantidad
    )

# --- Endpoints de Compra (Commit 5) ---

@app.post("/carrito/cancelar", tags=["Carrito"])
async def cancelar_carrito(
    usuario: Usuario = Depends(get_usuario_actual),
    session: Session = Depends(get_session)
):
    await CarritoService.vaciar_carrito(session, usuario)
    return {"message": "Carrito cancelado"}

@app.post("/carrito/finalizar", response_model=CompraResponse, tags=["Compra"])
async def finalizar_compra(
    datos_compra: CompraCreate,
    usuario: Usuario = Depends(get_usuario_actual),
    session: Session = Depends(get_session)
):
    compra_realizada = await CompraService.finalizar_compra(
        session, 
        usuario, 
        datos_compra
    )
    return compra_realizada

# --- Endpoints de Historial de Compras (Commit 6) ---

@app.get("/compras", response_model=List[CompraResumenResponse], tags=["Compra"])
async def obtener_historial_compras(
    usuario: Usuario = Depends(get_usuario_actual),
    session: Session = Depends(get_session)
):
    return await CompraService.obtener_historial_compras(session, usuario)

@app.get("/compras/{id}", response_model=CompraResponse, tags=["Compra"])
async def obtener_detalle_compra(
    id: int,
    usuario: Usuario = Depends(get_usuario_actual),
    session: Session = Depends(get_session)
):
    return await CompraService.obtener_detalle_compra(session, usuario, id)

# ---

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)