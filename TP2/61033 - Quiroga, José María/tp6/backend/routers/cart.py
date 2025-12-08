from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from db import get_session
from core_models import Cart, CartItem, Product, Purchase, PurchaseItem
from auth import get_current_user
from typing import Optional

router = APIRouter()


class AddToCartSchema(BaseModel):
    product_id: int
    cantidad: int = 1


def get_active_cart_for_user(session: Session, user_id: int) -> Cart:
    stmt = select(Cart).where(Cart.usuario_id == user_id, Cart.estado == "activo")
    cart = session.exec(stmt).first()
    if not cart:
        cart = Cart(usuario_id=user_id)
        session.add(cart)
        session.commit()
        session.refresh(cart)
    return cart


@router.post("/carrito")
def add_to_cart(payload: AddToCartSchema, user=Depends(get_current_user), session: Session = Depends(get_session)):
    product = session.get(Product, payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if product.existencia < payload.cantidad:
        raise HTTPException(status_code=400, detail="Producto sin stock suficiente")
    cart = get_active_cart_for_user(session, user.id)
    stmt = select(CartItem).where(CartItem.cart_id == cart.id, CartItem.producto_id == product.id)
    item = session.exec(stmt).first()
    if item:
        item.cantidad += payload.cantidad
    else:
        item = CartItem(cart_id=cart.id, producto_id=product.id, cantidad=payload.cantidad)
        session.add(item)
    session.commit()
    return {"ok": True}


@router.delete("/carrito/{product_id}")
def remove_from_cart(product_id: int, user=Depends(get_current_user), session: Session = Depends(get_session)):
    cart = get_active_cart_for_user(session, user.id)
    stmt = select(CartItem).where(CartItem.cart_id == cart.id, CartItem.producto_id == product_id)
    item = session.exec(stmt).first()
    if not item:
        raise HTTPException(status_code=404, detail="Producto no en el carrito")
    session.delete(item)
    session.commit()
    return {"ok": True}


@router.get("/carrito")
def view_cart(user=Depends(get_current_user), session: Session = Depends(get_session)):
    cart = get_active_cart_for_user(session, user.id)
    items = session.exec(select(CartItem).where(CartItem.cart_id == cart.id)).all()
    result = []
    total = 0.0
    iva_total = 0.0
    for it in items:
        prod = session.get(Product, it.producto_id)
        subtotal = prod.precio * it.cantidad
        # compute IVA per product category
        iva_rate = 0.10 if prod.categoria.lower() == "electrónica" or prod.categoria.lower() == "electronica" else 0.21
        iva = subtotal * iva_rate
        iva_total += iva
        result.append({"producto": prod, "cantidad": it.cantidad, "subtotal": subtotal, "iva": iva})
        total += subtotal

    envio = 0.0 if total > 1000 else 50.0
    grand_total = total + iva_total + envio
    return {"items": result, "subtotal": total, "iva_total": iva_total, "envio": envio, "total": grand_total}


class FinalizeSchema(BaseModel):
    direccion: str
    tarjeta: str


@router.post("/carrito/finalizar")
def finalize_cart(payload: FinalizeSchema, user=Depends(get_current_user), session: Session = Depends(get_session)):
    cart = get_active_cart_for_user(session, user.id)
    items = session.exec(select(CartItem).where(CartItem.cart_id == cart.id)).all()
    if not items:
        raise HTTPException(status_code=400, detail="Carrito vacío")
    total = 0.0
    iva_total = 0.0
    purchase_items = []
    for it in items:
        prod = session.get(Product, it.producto_id)
        if prod.existencia < it.cantidad:
            raise HTTPException(status_code=400, detail=f"Producto {prod.nombre} sin stock suficiente")
        subtotal = prod.precio * it.cantidad
        iva_rate = 0.10 if prod.categoria.lower() == "electrónica" or prod.categoria.lower() == "electronica" else 0.21
        iva = subtotal * iva_rate
        total += subtotal
        iva_total += iva
        purchase_items.append((prod, it.cantidad))

    envio = 0.0 if total > 1000 else 50.0
    grand_total = total + iva_total + envio

    purchase = Purchase(usuario_id=user.id, direccion=payload.direccion, tarjeta=payload.tarjeta, total=grand_total, envio=envio)
    session.add(purchase)
    session.commit()
    session.refresh(purchase)

    for prod, cantidad in purchase_items:
        pi = PurchaseItem(compra_id=purchase.id, producto_id=prod.id, cantidad=cantidad, nombre=prod.nombre, precio_unitario=prod.precio)
        session.add(pi)
        # decrement stock
        prod.existencia = max(0, prod.existencia - cantidad)
    # finalize cart: delete items and mark finalizado
    session.exec(select(CartItem).where(CartItem.cart_id == cart.id)).all()
    # remove items
    for it in items:
        session.delete(it)
    cart.estado = "finalizado"
    session.commit()

    return {"ok": True, "compra_id": purchase.id, "subtotal": total, "iva_total": iva_total, "envio": envio, "total": grand_total}


@router.post("/carrito/cancelar")
def cancel_cart(user=Depends(get_current_user), session: Session = Depends(get_session)):
    cart = get_active_cart_for_user(session, user.id)
    items = session.exec(select(CartItem).where(CartItem.cart_id == cart.id)).all()
    for it in items:
        session.delete(it)
    session.commit()
    return {"ok": True}
