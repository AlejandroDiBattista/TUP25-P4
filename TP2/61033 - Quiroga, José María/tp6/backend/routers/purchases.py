from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from core_models import Purchase, PurchaseItem
from auth import get_current_user

router = APIRouter()


@router.get("/compras")
def list_purchases(user=Depends(get_current_user), session: Session = Depends(get_session)):
    stmt = select(Purchase).where(Purchase.usuario_id == user.id)
    results = session.exec(stmt).all()
    return results


@router.get("/compras/{compra_id}")
def get_purchase(compra_id: int, user=Depends(get_current_user), session: Session = Depends(get_session)):
    purchase = session.get(Purchase, compra_id)
    if not purchase or purchase.usuario_id != user.id:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    items = session.exec(select(PurchaseItem).where(PurchaseItem.compra_id == compra_id)).all()
    return {"purchase": purchase, "items": items}
