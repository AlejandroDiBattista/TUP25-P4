from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from sqlmodel import select
from db import get_session
from models import Producto

router = APIRouter()

@router.get("")
@router.get("/")
def listar_productos(buscar: Optional[str] = Query(None), categoria: Optional[str] = Query(None)):
    session = get_session()
    q = select(Producto)
    productos = session.exec(q).all()
    results = []
    for p in productos:
        matches = True
        if buscar:
            b = buscar.lower()
            if b not in (p.nombre or "").lower() and b not in (p.descripcion or "").lower():
                matches = False
        if categoria:
            c = categoria.lower()
            if c not in (p.categoria or "").lower():
                matches = False
        if matches:
            results.append({
                "id": p.id,
                "titulo": p.nombre,
                "precio": p.precio,
                "descripcion": p.descripcion,
                "categoria": p.categoria,
                "valoracion": 0,
                "existencia": p.existencia,
                "imagen": p.imagen
            })
    return results

@router.get("/{product_id}")
def obtener_producto(product_id: int):
    session = get_session()
    p = session.get(Producto, product_id)
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {
        "id": p.id,
        "titulo": p.nombre,
        "precio": p.precio,
        "descripcion": p.descripcion,
        "categoria": p.categoria,
        "valoracion": 0,
        "existencia": p.existencia,
        "imagen": p.imagen
    }
