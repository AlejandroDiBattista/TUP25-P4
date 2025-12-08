from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select

from db import get_session
from routers.auth import get_current_user
from models.usuario import Usuario
from models.compra import Compra, ItemCompra

router = APIRouter()


# ✅ Ver historial de compras
@router.get("/compras")
def historial(
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    compras = session.exec(
        select(Compra).where(Compra.usuario_id == current_user.id)
    ).all()

    return compras


# ✅ Ver detalle de una compra
@router.get("/compras/{compra_id}")
def detalle_compra(
    compra_id: int,
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    compra = session.get(Compra, compra_id)

    if not compra or compra.usuario_id != current_user.id:
        raise HTTPException(404, "Compra no encontrada")

    items = session.exec(
        select(ItemCompra).where(ItemCompra.compra_id == compra.id)
    ).all()

    return {
        "compra": compra,
        "items": items
    }
