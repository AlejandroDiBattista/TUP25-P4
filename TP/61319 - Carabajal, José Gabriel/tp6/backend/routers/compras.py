from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Annotated, List
from pydantic import BaseModel

from db import get_session
from models.compras import Compra, CompraItem
from schemas.compras import CompraOut, CompraItemOut

router = APIRouter(prefix="/compras", tags=["compras"])

# -----------------------------
# Schema local para el DETALLE
# -----------------------------
class CompraDetalleOut(BaseModel):
    id: int
    fecha: str                  
    direccion: str
    tarjeta: str                
    items: List[CompraItemOut]
    subtotal: float
    iva: float
    envio: float
    total: float


@router.get("", response_model=List[CompraOut])
def listar_compras(
    usuario_id: int,
    session: Annotated[Session, Depends(get_session)]
):
    compras = session.exec(
        select(Compra)
        .where(Compra.usuario_id == usuario_id)
        .order_by(Compra.id.desc())
    ).all()

    res: List[CompraOut] = []
    for c in compras:
        items = session.exec(
            select(CompraItem).where(CompraItem.compra_id == c.id)
        ).all()
        res.append(
            CompraOut(
                id=c.id,
                fecha=c.fecha,
                subtotal=c.subtotal,
                iva=c.iva,
                envio=c.envio,
                total=c.total,
                items=[
                    CompraItemOut(
                        producto_id=i.producto_id,
                        nombre=i.nombre,
                        precio_unitario=i.precio_unitario,
                        cantidad=i.cantidad,
                    )
                    for i in items
                ],
            )
        )
    return res


# -----------------------------
# Detalle de compra por ID
# GET /compras/{compra_id}?usuario_id=...
# -----------------------------
@router.get("/{compra_id}", response_model=CompraDetalleOut)
def obtener_compra_por_id(
    compra_id: int,
    usuario_id: int,
    session: Annotated[Session, Depends(get_session)],
):
    compra = session.get(Compra, compra_id)
    if not compra or compra.usuario_id != usuario_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compra no encontrada",
        )

    items = session.exec(
        select(CompraItem).where(CompraItem.compra_id == compra_id)
    ).all()

    return CompraDetalleOut(
        id=compra.id,
        fecha=(compra.fecha.isoformat() if hasattr(compra.fecha, "isoformat") else str(compra.fecha)),
        direccion=compra.direccion,
        tarjeta=compra.tarjeta,  
        items=[
            CompraItemOut(
                producto_id=i.producto_id,
                nombre=i.nombre,
                precio_unitario=i.precio_unitario,
                cantidad=i.cantidad,
            )
            for i in items
        ],
        subtotal=compra.subtotal,
        iva=compra.iva,
        envio=compra.envio,
        total=compra.total,
    )
