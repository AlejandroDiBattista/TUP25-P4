from __future__ import annotations

from fastapi import HTTPException, status
from sqlmodel import Session, select

from models import Compra, CompraItem
from schemas.carrito import CarritoItemDetalle
from schemas.compra import CompraDetalle, CompraResumen


def listar_compras(*, usuario_id: int, session: Session) -> list[CompraResumen]:
    consulta = (
        select(Compra)
        .where(Compra.usuario_id == usuario_id)
        .order_by(Compra.fecha.desc())
    )
    compras = session.exec(consulta).all()
    return [
        CompraResumen(
            id=compra.id,
            fecha=compra.fecha,
            total=compra.total,
            envio=compra.envio,
            subtotal=compra.subtotal,
            iva=compra.iva,
            direccion=compra.direccion,
        )
        for compra in compras
    ]


def obtener_compra_detalle(
    *, usuario_id: int, compra_id: int, session: Session
) -> CompraDetalle:
    compra = session.get(Compra, compra_id)
    if compra is None or compra.usuario_id != usuario_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Compra no encontrada")

    consulta_items = select(CompraItem).where(CompraItem.compra_id == compra.id)
    items = session.exec(consulta_items).all()

    vista_items = [
        CarritoItemDetalle(
            producto_id=item.producto_id,
            nombre=item.nombre,
            cantidad=item.cantidad,
            precio_unitario=item.precio_unitario,
            subtotal=round(item.precio_unitario * item.cantidad, 2),
            categoria=item.categoria,
            imagen=item.imagen,
            valoracion=None,
        )
        for item in items
    ]

    return CompraDetalle(
        id=compra.id,
        fecha=compra.fecha,
        total=compra.total,
        envio=compra.envio,
        subtotal=compra.subtotal,
        iva=compra.iva,
        direccion=compra.direccion,
        items=vista_items,
    )
