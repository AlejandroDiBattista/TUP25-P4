from fastapi import APIRouter, HTTPException, Depends, Query
from sqlmodel import Session, select
from typing import Optional, List
import unicodedata

from db import get_session
from models.producto import Producto

router = APIRouter()


# ✅ Función auxiliar para normalizar texto (elimina acentos y convierte a minúsculas)
def normalizar(texto: str):
    if not texto:
        return ""
    texto = unicodedata.normalize("NFD", texto)
    texto = ''.join(c for c in texto if unicodedata.category(c) != 'Mn')
    return texto.lower()


@router.get("/productos", response_model=List[Producto])
def listar_productos(
    categoria: Optional[str] = Query(None, description="Filtrar por categoría"),
    buscar: Optional[str] = Query(None, description="Buscar por texto en nombre o descripción"),
    session: Session = Depends(get_session)
):
    """
    Obtener productos con filtros opcionales:
    - categoria=ropa, electro, etc.
    - buscar=texto parcial (en nombre o descripción)
    """

    # Obtener todos los productos
    productos = session.exec(select(Producto)).all()

    # ✅ Filtrar por categoría (sin acentos ni mayúsculas)
    if categoria:
        cat_norm = normalizar(categoria)
        productos = [
            p for p in productos
            if cat_norm in normalizar(p.categoria)
        ]

    # ✅ Buscar por texto (sin acentos ni mayúsculas)
    if buscar:
        q_norm = normalizar(buscar)
        productos = [
            p for p in productos
            if q_norm in normalizar(p.nombre) or q_norm in normalizar(p.descripcion)
        ]

    return productos


@router.get("/productos/{producto_id}", response_model=Producto)
def obtener_producto(producto_id: int, session: Session = Depends(get_session)):
    """
    Obtener detalle de un producto por ID.
    """
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    return producto
