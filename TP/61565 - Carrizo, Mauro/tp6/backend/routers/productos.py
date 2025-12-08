from fastapi import APIRouter, Depends, Query, HTTPException
from sqlmodel import Session, select, or_
from database import get_session
from models import Producto
from schemas import ProductoResponse

router = APIRouter()

@router.get("/productos", response_model=list[ProductoResponse])
async def obtener_productos(
    categoria: str | None = Query(None, description="Filtrar por categoría"),
    busqueda: str | None = Query(None, description="Buscar en nombre y descripción"),
    session: Session = Depends(get_session)
):
    """Obtener lista de productos con filtros opcionales"""
    statement = select(Producto)
    
    # Aplicar filtros
    if categoria:
        statement = statement.where(Producto.categoria == categoria)
    
    if busqueda:
        statement = statement.where(
            or_(
                Producto.nombre.contains(busqueda),
                Producto.descripcion.contains(busqueda)
            )
        )
    
    productos = session.exec(statement).all()
    return productos

@router.get("/productos/{id}", response_model=ProductoResponse)
async def obtener_producto(
    id: int,
    session: Session = Depends(get_session)
):
    """Obtener detalles de un producto específico"""
    producto = session.get(Producto, id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

