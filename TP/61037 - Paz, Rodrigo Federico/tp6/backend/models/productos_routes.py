from fastapi import APIRouter, Query, HTTPException
from sqlmodel import Session, select
from models.database import engine
from models.productos import Producto

router = APIRouter()

@router.get("/productos")
def listar_productos(q: str | None = Query(default=None), categoria: str | None = Query(default=None)):
    with Session(engine) as session:
        stmt = select(Producto)
        if q:
            q_like = f"%{q.lower()}%"
            stmt = stmt.where(
                (Producto.nombre.ilike(q_like)) |
                (Producto.descripcion.ilike(q_like))
            )
        if categoria and categoria.lower() != "todas":
            stmt = stmt.where(Producto.categoria == categoria)
        return session.exec(stmt).all()

@router.get("/productos/{id}")
def detalle_producto(id: int):
    with Session(engine) as session:
        p = session.get(Producto, id)
        if not p:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return p

@router.get("/productos/{id}/stock")
def verificar_stock(id: int):
    """Endpoint para verificar stock disponible de un producto"""
    with Session(engine) as session:
        producto = session.get(Producto, id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        return {
            "producto_id": producto.id,
            "nombre": producto.nombre,
            "existencia": producto.existencia,
            "disponible": producto.existencia > 0
        }
