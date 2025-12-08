from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from ..database import get_session
from models import Compra, CompraItem
from ..deps import get_current_user

router = APIRouter(prefix="/compras", tags=["compras"]) 

@router.get("")
def listar_compras(current=Depends(get_current_user)):
    with get_session() as session:
        compras = session.exec(select(Compra).where(Compra.usuario_id == current.id)).all()
        resultado = []
        for c in compras:
            items = []
            for it in c.items:
                if it.producto:
                    items.append({
                        "producto_id": it.producto_id,
                        "titulo": it.producto.titulo,
                        "cantidad": it.cantidad,
                        "precio_unitario": it.precio_unitario,
                        "subtotal": it.cantidad * it.precio_unitario,
                    })
            resultado.append({"id": c.id, "total": c.total, "items": items})
        return resultado

@router.get("/{compra_id}")
def detalle_compra(compra_id: int, current=Depends(get_current_user)):
    with get_session() as session:
        compra = session.get(Compra, compra_id)
        if not compra or compra.usuario_id != current.id:
            raise HTTPException(status_code=404, detail="Compra no encontrada")
        items = []
        for it in compra.items:
            if it.producto:
                items.append({
                    "producto_id": it.producto_id,
                    "titulo": it.producto.titulo,
                    "cantidad": it.cantidad,
                    "precio_unitario": it.precio_unitario,
                    "subtotal": it.cantidad * it.precio_unitario,
                })
        return {"id": compra.id, "total": compra.total, "items": items}
