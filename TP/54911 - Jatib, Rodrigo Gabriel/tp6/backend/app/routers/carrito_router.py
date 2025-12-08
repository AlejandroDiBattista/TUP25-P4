from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from .. import auth, crud, db, schemas
from ..models import Product

router = APIRouter(prefix="/carrito", tags=["carrito"])


@router.post("/", response_model=Any)
@router.post("", response_model=Any, include_in_schema=False)
def agregar_al_carrito(item: schemas.CartItemCreate, current_user=Depends(auth.get_current_user)):
    with Session(db.engine) as session:
        cart = crud.get_or_create_cart(session, current_user.id)
        producto = crud.get_product(session, item.producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        try:
            added = crud.add_item_to_cart(session, cart, producto, item.cantidad)
            return {"ok": True, "item_id": added.id}
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{product_id}")
def quitar_del_carrito(product_id: int, current_user=Depends(auth.get_current_user)):
    with Session(db.engine) as session:
        cart = crud.get_or_create_cart(session, current_user.id)
        try:
            crud.remove_item_from_cart(session, cart, product_id)
            return {"ok": True}
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))


@router.get("/")
def ver_carrito(current_user=Depends(auth.get_current_user)):
    with Session(db.engine) as session:
        cart = crud.get_or_create_cart(session, current_user.id)
        items = crud.list_cart_items(session, cart)
        payload: List[Dict[str, Any]] = []
        subtotal = 0.0
        iva_total = 0.0

        for it in items:
            prod = session.get(Product, it.producto_id)
            if not prod:
                continue

            line_subtotal = prod.precio * it.cantidad
            subtotal += line_subtotal
            rate = 0.10 if prod.categoria and prod.categoria.lower().startswith("electr") else 0.21
            iva_line = line_subtotal * rate
            iva_total += iva_line

            payload.append(
                {
                    "producto_id": it.producto_id,
                    "nombre": prod.nombre,
                    "cantidad": it.cantidad,
                    "precio_unitario": prod.precio,
                    "categoria": prod.categoria,
                    "descripcion": prod.descripcion,
                    "iva": round(iva_line, 2),
                    "iva_rate": rate,
                    "imagen": prod.imagen,
                }
            )

        total_con_iva = subtotal + iva_total
        envio = 0.0 if total_con_iva >= 1000 else (50.0 if subtotal > 0 else 0.0)
        total = subtotal + iva_total + envio

        return {
            "cart_id": cart.id,
            "estado": cart.estado,
            "subtotal": round(subtotal, 2),
            "iva_total": round(iva_total, 2),
            "envio": envio,
            "total": round(total, 2),
            "items": payload,
        }


@router.post("/finalizar")
def finalizar_compra(payload: dict, current_user=Depends(auth.get_current_user)):
    direccion = payload.get("direccion")
    tarjeta = payload.get("tarjeta")
    if not direccion or not tarjeta:
        raise HTTPException(status_code=400, detail="direccion y tarjeta son requeridos")
    with Session(db.engine) as session:
        cart = crud.get_or_create_cart(session, current_user.id)
        try:
            purchase = crud.finalize_cart(session, cart, direccion, tarjeta)
            return {
                "ok": True,
                "purchase_id": purchase.id,
                "total": purchase.total,
                "iva_total": purchase.iva_total,
                "envio": purchase.envio,
            }
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))


@router.post("/cancelar")
def cancelar_compra(current_user=Depends(auth.get_current_user)):
    with Session(db.engine) as session:
        cart = crud.get_or_create_cart(session, current_user.id)
        try:
            crud.cancel_cart(session, cart)
            return {"ok": True}
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
