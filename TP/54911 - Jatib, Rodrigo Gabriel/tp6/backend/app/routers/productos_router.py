from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import List, Optional
from .. import db, crud, schemas

router = APIRouter(prefix="/productos", tags=["productos"])


@router.get("/", response_model=List[schemas.ProductRead])
def listar_productos(categoria: Optional[str] = Query(None), q: Optional[str] = Query(None)):
    with Session(db.engine) as session:
        productos = crud.list_products(session, categoria=categoria, q=q)
        return productos


@router.get("/{product_id}", response_model=schemas.ProductRead)
def detalle_producto(product_id: int):
    with Session(db.engine) as session:
        producto = crud.get_product(session, product_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return producto
