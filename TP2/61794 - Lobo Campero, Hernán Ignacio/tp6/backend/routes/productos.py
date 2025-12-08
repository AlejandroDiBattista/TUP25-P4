from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
import json
from pathlib import Path
from typing import List

from database import get_session
from models import Producto
from schemas import ProductoResponse

router = APIRouter(prefix="/api", tags=["productos"])


def cargar_productos_json():
    """Cargar productos desde el archivo JSON"""
    ruta_productos = Path(__file__).parent.parent / "productos.json"
    with open(ruta_productos, "r", encoding="utf-8") as archivo:
        return json.load(archivo)


def insertar_productos_iniciales(session: Session):
    """Insertar productos iniciales desde JSON a la base de datos"""
    # Verificar si ya hay productos
    statement = select(Producto)
    productos_existentes = session.exec(statement).first()
    
    if productos_existentes:
        return  # Ya hay productos en la BD
    
    # Cargar productos desde JSON
    productos_json = cargar_productos_json()
    
    for producto_data in productos_json:
        nuevo_producto = Producto(
            titulo=producto_data.get("titulo"),
            precio=producto_data.get("precio"),
            descripcion=producto_data.get("descripcion"),
            categoria=producto_data.get("categoria"),
            valoracion=producto_data.get("valoracion"),
            existencia=producto_data.get("existencia"),
            imagen=producto_data.get("imagen")
        )
        session.add(nuevo_producto)
    
    session.commit()


@router.on_event("startup")
def startup():
    """Cargar productos iniciales al startup"""
    from database import engine
    with Session(engine) as session:
        insertar_productos_iniciales(session)


@router.get("/productos", response_model=List[ProductoResponse])
def obtener_productos(
    categoria: str = None,
    busqueda: str = None,
    session: Session = Depends(get_session)
):
    """
    Obtener lista de productos con filtros opcionales
    - categoria: filtrar por categoría
    - busqueda: buscar por título o descripción
    """
    
    statement = select(Producto)
    
    # Filtrar por categoría
    if categoria:
        statement = statement.where(Producto.categoria == categoria)
    
    # Filtrar por búsqueda (en título o descripción)
    if busqueda:
        busqueda_lower = busqueda.lower()
        statement = statement.where(
            (Producto.titulo.ilike(f"%{busqueda_lower}%")) |
            (Producto.descripcion.ilike(f"%{busqueda_lower}%"))
        )
    
    productos = session.exec(statement).all()
    return productos


@router.get("/productos/{producto_id}", response_model=ProductoResponse)
def obtener_producto(producto_id: int, session: Session = Depends(get_session)):
    """Obtener detalles de un producto específico"""
    
    producto = session.get(Producto, producto_id)
    
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    return producto


@router.get("/categorias")
def obtener_categorias(session: Session = Depends(get_session)):
    """Obtener lista de categorías disponibles"""
    
    statement = select(Producto.categoria).distinct()
    categorias = session.exec(statement).all()
    
    return {"categorias": list(set(categorias))}
