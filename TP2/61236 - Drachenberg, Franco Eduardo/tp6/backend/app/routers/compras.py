from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.api.deps import get_current_user, get_session
from app.models import Usuario
from app.schemas.compra import CompraDetalle, CompraResumen
from app.services.compras import CompraNoEncontradaError, listar_compras, obtener_compra

router = APIRouter(prefix="/compras", tags=["Compras"])


@router.get("", response_model=list[CompraResumen])
def listar_historial(
    session: Session = Depends(get_session),
    usuario: Usuario = Depends(get_current_user),
) -> list[CompraResumen]:
    return listar_compras(session, usuario.id)


@router.get("/{compra_id}", response_model=CompraDetalle)
def obtener_historial(
    compra_id: int,
    session: Session = Depends(get_session),
    usuario: Usuario = Depends(get_current_user),
) -> CompraDetalle:
    try:
        return obtener_compra(session, usuario.id, compra_id)
    except CompraNoEncontradaError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))
