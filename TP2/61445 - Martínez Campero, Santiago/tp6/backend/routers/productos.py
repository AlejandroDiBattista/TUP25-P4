from fastapi import APIRouter, HTTPException, Query
from sqlmodel import Session, select
from typing import Optional
from models import Producto, ProductoResponse
from database import engine

router = APIRouter(prefix="/productos", tags=["productos"])


@router.get("", response_model=list[ProductoResponse])
def listar_productos(
    categoria: Optional[str] = Query(None),
    buscar: Optional[str] = Query(None),
    ordenar: Optional[str] = Query(None),
    precioMin: Optional[float] = Query(None),
    precioMax: Optional[float] = Query(None),
):
    with Session(engine) as session:
        statement = select(Producto)
        
        if categoria:
            statement = statement.where(Producto.categoria == categoria)
        
        if buscar:
            statement = statement.where(
                Producto.nombre.ilike(f"%{buscar}%") | 
                Producto.descripcion.ilike(f"%{buscar}%")
            )
        
        # Aplicar filtros de precio
        if precioMin is not None:
            statement = statement.where(Producto.precio >= precioMin)
        
        if precioMax is not None:
            statement = statement.where(Producto.precio <= precioMax)
        
        # Aplicar ordenamiento
        if ordenar == "precio-asc":
            statement = statement.order_by(Producto.precio.asc())
        elif ordenar == "precio-desc":
            statement = statement.order_by(Producto.precio.desc())
        elif ordenar == "valoracion":
            statement = statement.order_by(Producto.valoracion.desc())
        else:
            # Por defecto, ordenar por nombre
            statement = statement.order_by(Producto.nombre.asc())
        
        productos = session.exec(statement).all()
        return productos


@router.get("/{producto_id}", response_model=ProductoResponse)
def obtener_producto(producto_id: int):
    with Session(engine) as session:
        producto = session.get(Producto, producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return producto


@router.get("/categorias/todas", response_model=list[str])
def obtener_categorias():
    with Session(engine) as session:
        statement = select(Producto.categoria).distinct()
        categorias = session.exec(statement).all()
        return sorted(list(set(categorias)))
