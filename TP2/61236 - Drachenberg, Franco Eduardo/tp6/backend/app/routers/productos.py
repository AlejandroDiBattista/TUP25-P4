import unicodedata
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.api.deps import get_session
from app.models import Producto
from app.schemas.producto import ProductoRead

router = APIRouter(tags=["Productos"])


@router.get("/productos", response_model=list[ProductoRead])
def listar_productos(
    categoria: Optional[str] = Query(default=None, description="Filtrar por categoría exacta"),
    buscar: Optional[str] = Query(default=None, description="Buscar en nombre y descripción"),
    session: Session = Depends(get_session),
) -> list[ProductoRead]:
    productos = session.exec(select(Producto)).all()

    if categoria:
        categoria_filtrada = _normalize(categoria)
        productos = [
            producto
            for producto in productos
            if categoria_filtrada in _normalize(producto.categoria)
        ]

    if buscar:
        termino_busqueda = _normalize(buscar)
        productos = [
            producto
            for producto in productos
            if termino_busqueda in _normalize(producto.nombre)
            or termino_busqueda in _normalize(producto.descripcion)
        ]

    productos.sort(key=lambda producto: _normalize(producto.nombre))
    return productos


@router.get("/productos/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, session: Session = Depends(get_session)) -> ProductoRead:
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return producto


def _normalize(value: Optional[str]) -> str:
    if not value:
        return ""
    normalized = unicodedata.normalize("NFKD", value)
    return "".join(char for char in normalized if not unicodedata.combining(char)).lower()

