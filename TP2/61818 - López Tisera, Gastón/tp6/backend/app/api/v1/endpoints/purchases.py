from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.api.deps import get_current_active_user, get_db
from app.schemas import PurchaseRead
from app.services.purchase import get_purchase, list_purchases

router = APIRouter(prefix="/compras", tags=["compras"])


@router.get("/", response_model=list[PurchaseRead])
def listar_compras(
    session: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
) -> list[PurchaseRead]:
    compras = list_purchases(session, current_user)
    return [PurchaseRead.model_validate(compra) for compra in compras]


@router.get("/{compra_id}", response_model=PurchaseRead)
def obtener_compra(
    compra_id: int,
    session: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
) -> PurchaseRead:
    try:
        compra = get_purchase(session, current_user, compra_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    return PurchaseRead.model_validate(compra)

