from fastapi import APIRouter, HTTPException, Query
from sqlmodel import Session, select
from db.database import engine
from models.productos import Producto

router = APIRouter()

@router.get("/productos")
def listar_productos(
    categoria: str = Query(None, description="Filtrar por categoría"),
    busqueda: str = Query(None, description="Búsqueda por nombre o descripción")
):
    """Obtener lista de productos con filtros opcionales"""
    with Session(engine) as session:
        query = select(Producto)
        
        if categoria:
            query = query.where(Producto.categoria.ilike(f"%{categoria}%"))
        
        if busqueda:
            query = query.where(
                (Producto.nombre.ilike(f"%{busqueda}%")) |
                (Producto.descripcion.ilike(f"%{busqueda}%"))
            )
        
        productos = session.exec(query).all()
        return productos


@router.get("/productos/{producto_id}")
def obtener_producto(producto_id: int):
    """Obtener detalles de un producto específico"""
    with Session(engine) as session:
        producto = session.get(Producto, producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return producto