from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.productos import Producto

router = APIRouter()

@router.get("/")
def listar_productos(q: str | None = None, categoria: str | None = None, db: Session = Depends(get_session)):
    stmt = select(Producto)
    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where((Producto.nombre.ilike(like)) | (Producto.descripcion.ilike(like)))
    if categoria:
        stmt = stmt.where(Producto.categoria == categoria)
    return db.exec(stmt).all()

@router.get("/{id}")
def producto_detalle(id: int, db: Session = Depends(get_session)):
    p = db.get(Producto, id)
    if not p:
        raise HTTPException(404, "Producto no encontrado")
    return p
