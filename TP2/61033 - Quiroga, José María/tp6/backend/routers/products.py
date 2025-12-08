from fastapi import APIRouter, Query, HTTPException, Depends
from sqlmodel import Session, select
from typing import Optional, List
from db import get_session
from core_models import Product

router = APIRouter()


@router.get("/productos")
def list_products(q: Optional[str] = Query(None), categoria: Optional[str] = Query(None), session: Session = Depends(get_session)) -> List[Product]:
    stmt = select(Product)
    if q:
        stmt = stmt.where(Product.nombre.contains(q) | Product.descripcion.contains(q))
    if categoria:
        stmt = stmt.where(Product.categoria == categoria)
    results = session.exec(stmt).all()
    return results


@router.get("/productos/{product_id}")
def get_product(product_id: int, session: Session = Depends(get_session)):
    prod = session.get(Product, product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return prod
