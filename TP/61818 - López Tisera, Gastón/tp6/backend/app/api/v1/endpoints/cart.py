from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api.deps import get_current_active_user, get_db
from app.models import Cart
from app.schemas import CartItemCreate, CartItemRead, CartRead, CheckoutRequest
from app.services.cart import (
    add_item_to_cart,
    calculate_totals,
    clear_cart,
    finalize_cart,
    remove_item_from_cart,
)

router = APIRouter(prefix="/carrito", tags=["carrito"])


def _ensure_cart(session: Session, user_id: int) -> Cart:
    statement = select(Cart).where(Cart.usuario_id == user_id, Cart.estado == "activo")
    cart = session.exec(statement).first()
    if not cart:
        cart = Cart(usuario_id=user_id)
        session.add(cart)
        session.commit()
        session.refresh(cart)
    return cart


@router.get("/", response_model=CartRead)
def obtener_carrito(
    session: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
) -> CartRead:
    """Obtener el carrito activo del usuario."""
    cart = _ensure_cart(session, current_user.id)
    return CartRead.model_validate(cart)


@router.post("/", response_model=CartRead)
def agregar_al_carrito(
    item: CartItemCreate,
    session: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
) -> CartRead:
    """Agregar un producto al carrito."""
    cart = add_item_to_cart(session, current_user, item.producto_id, item.cantidad)
    return CartRead.model_validate(cart)


@router.delete("/{producto_id}", response_model=CartRead)
def eliminar_del_carrito(
    producto_id: int,
    session: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
) -> CartRead:
    """Eliminar un producto del carrito."""
    cart = remove_item_from_cart(session, current_user, producto_id)
    return CartRead.model_validate(cart)


@router.post("/cancelar", response_model=CartRead)
def cancelar_carrito(
    session: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
) -> CartRead:
    """Cancelar la compra (vaciar el carrito)."""
    cart = clear_cart(session, current_user)
    return CartRead.model_validate(cart)


@router.get("/totales")
def obtener_totales(
    session: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
) -> dict:
    """Obtener totales del carrito."""
    cart = _ensure_cart(session, current_user.id)
    if not cart.items:
        # Retornar totales en 0 cuando el carrito está vacío
        return {
            "subtotal": 0.0,
            "iva": 0.0,
            "envio": 0.0,
            "total": 0.0,
        }
    return calculate_totals(session, cart)


@router.post("/finalizar")
def finalizar_compra(
    checkout_data: CheckoutRequest,
    session: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
) -> dict:
    """Finalizar la compra."""
    purchase = finalize_cart(
        session,
        current_user,
        direccion=checkout_data.direccion,
        tarjeta=checkout_data.tarjeta,
    )
    return {
        "message": "Compra finalizada con éxito.",
        "compra_id": purchase.id,
    }

