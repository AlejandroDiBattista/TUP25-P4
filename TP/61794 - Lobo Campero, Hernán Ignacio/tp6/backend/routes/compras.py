from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database.connection import get_session
from models.compra import Compra, ItemCompra
from schemas.compra import CompraResponse
from utils.auth import decode_token, obtener_usuario_id

router = APIRouter(prefix="/api", tags=["compras"])


@router.get("/compras", response_model=List[dict])
def obtener_compras(
    token: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """Obtener todas las compras del usuario"""
    usuario_id = obtener_usuario_id(token)
    
    compras = session.query(Compra).filter(Compra.usuario_id == usuario_id).all()
    
    resultado = []
    for compra in compras:
        items = session.query(ItemCompra).filter(ItemCompra.compra_id == compra.id).all()
        resultado.append({
            "id": compra.id,
            "usuario_id": compra.usuario_id,
            "fecha": compra.fecha.isoformat(),
            "direccion": compra.direccion,
            "total": compra.total,
            "iva": compra.iva,
            "envio": compra.envio,
            "tarjeta_ultimos_digitos": compra.tarjeta_ultimos_digitos,
            "items": [{"id": ic.id, "compra_id": ic.compra_id, "producto_id": ic.producto_id, "cantidad": ic.cantidad, "nombre": ic.nombre, "precio_unitario": ic.precio_unitario} for ic in items]
        })
    
    return resultado


@router.get("/compras/{compra_id}", response_model=dict)
def obtener_compra(
    compra_id: int,
    token: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """Obtener detalles de una compra específica"""
    usuario_id = obtener_usuario_id(token)
    
    compra = session.query(Compra).filter(Compra.id == compra_id).first()
    
    if not compra:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compra no encontrada"
        )
    
    if compra.usuario_id != usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado para ver esta compra"
        )
    
    items = session.query(ItemCompra).filter(ItemCompra.compra_id == compra.id).all()
    
    return {
        "id": compra.id,
        "usuario_id": compra.usuario_id,
        "fecha": compra.fecha.isoformat(),
        "direccion": compra.direccion,
        "total": compra.total,
        "iva": compra.iva,
        "envio": compra.envio,
        "tarjeta_ultimos_digitos": compra.tarjeta_ultimos_digitos,
        "items": [{"id": ic.id, "compra_id": ic.compra_id, "producto_id": ic.producto_id, "cantidad": ic.cantidad, "nombre": ic.nombre, "precio_unitario": ic.precio_unitario} for ic in items]
    }

