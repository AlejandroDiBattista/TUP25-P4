from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from .. import auth, crud, db

router = APIRouter(prefix="/compras", tags=["compras"])


@router.get("/")
def resumen_compras(current_user=Depends(auth.get_current_user)):
    with Session(db.engine) as session:
        compras = crud.list_purchases_for_user(session, current_user.id)
        return [
            {"id": c.id, "fecha": c.fecha.isoformat(), "total": c.total, "iva_total": c.iva_total, "envio": c.envio}
            for c in compras
        ]


@router.get("/{purchase_id}")
def detalle_compra(purchase_id: int, current_user=Depends(auth.get_current_user)):
    with Session(db.engine) as session:
        purchase = crud.get_purchase(session, purchase_id)
        if not purchase or purchase.usuario_id != current_user.id:
            raise HTTPException(status_code=404, detail="Compra no encontrada")
        from ..models import Product, PurchaseItem

        pitems = session.exec(select(PurchaseItem).where(PurchaseItem.purchase_id == purchase.id)).all()
        items = []
        subtotal = 0.0
        iva_total = 0.0

        for it in pitems:
            line_subtotal = it.precio_unitario * it.cantidad
            subtotal += line_subtotal
            prod = session.get(Product, it.producto_id)
            rate = 0.10 if prod and prod.categoria and prod.categoria.lower().startswith("electr") else 0.21
            iva_line = line_subtotal * rate
            iva_total += iva_line
            items.append(
                {
                    "producto_id": it.producto_id,
                    "cantidad": it.cantidad,
                    "nombre": it.nombre,
                    "precio_unitario": it.precio_unitario,
                    "iva": round(iva_line, 2),
                    "iva_rate": rate,
                    "categoria": prod.categoria if prod else None,
                }
            )
        # mask tarjeta to avoid leaking full card numbers
        def mask_card(num: Optional[str]):
            if not num:
                return None
            digits = ''.join([c for c in str(num) if c.isdigit()])
            if len(digits) <= 4:
                return digits
            return f"**** **** **** {digits[-4:]}"

        iva_total_reported = purchase.iva_total if purchase.iva_total else round(iva_total, 2)

        return {
            "id": purchase.id,
            "fecha": purchase.fecha.isoformat(),
            "direccion": purchase.direccion,
            "tarjeta": mask_card(purchase.tarjeta),
            "total": purchase.total,
            "envio": purchase.envio,
            "subtotal": round(subtotal, 2),
            "iva_total": round(iva_total_reported, 2),
            "items": items,
        }
