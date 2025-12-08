from datetime import datetime

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.core.config import get_settings
from app.models import Cart, CartItem, Product, Purchase, PurchaseItem, User


def _get_active_cart(session: Session, user: User) -> Cart:
    statement = select(Cart).where(Cart.usuario_id == user.id, Cart.estado == "activo")
    cart = session.exec(statement).first()
    if not cart:
        cart = Cart(usuario_id=user.id)
        session.add(cart)
        session.commit()
        session.refresh(cart)
    return cart


def add_item_to_cart(session: Session, user: User, producto_id: int, cantidad: int) -> Cart:
    product = session.get(Product, producto_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado.")

    cart = _get_active_cart(session, user)

    for item in cart.items:
        if item.producto_id == producto_id:
            nueva_cantidad = item.cantidad + cantidad
            
            # Si la nueva cantidad es <= 0, eliminar el item
            if nueva_cantidad <= 0:
                cart.items.remove(item)
                break
            
            # Validar stock solo si estamos aumentando
            if cantidad > 0 and product.existencia < nueva_cantidad:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No hay stock suficiente para la cantidad total solicitada.",
                )
            
            item.cantidad = nueva_cantidad
            break
    else:
        # Agregar nuevo item solo si cantidad es positiva
        if cantidad <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La cantidad debe ser mayor a 0.",
            )
        
        if product.existencia < cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay stock suficiente para el producto.",
            )
        
        cart.items.append(CartItem(producto_id=producto_id, cantidad=cantidad))

    cart.updated_at = datetime.utcnow()
    session.add(cart)
    session.commit()
    session.refresh(cart)
    return cart


def remove_item_from_cart(session: Session, user: User, producto_id: int) -> Cart:
    cart = _get_active_cart(session, user)
    cart.items = [item for item in cart.items if item.producto_id != producto_id]
    cart.updated_at = datetime.utcnow()
    session.add(cart)
    session.commit()
    session.refresh(cart)
    return cart


def clear_cart(session: Session, user: User) -> Cart:
    cart = _get_active_cart(session, user)
    cart.items.clear()
    cart.updated_at = datetime.utcnow()
    session.add(cart)
    session.commit()
    session.refresh(cart)
    return cart


def calculate_totals(session: Session, cart: Cart) -> dict[str, float]:
    settings = get_settings()
    subtotal = 0.0
    iva = 0.0

    for item in cart.items:
        product = session.get(Product, item.producto_id)
        if not product:
            continue
        item_total = product.precio * item.cantidad
        subtotal += item_total
        tasa = settings.iva_electronica if product.categoria.lower() == "electrónica" else settings.iva_general
        iva += item_total * tasa

    envio = 0.0 if subtotal >= settings.envio_gratuito_desde else settings.costo_envio
    total = subtotal + iva + envio

    return {
        "subtotal": round(subtotal, 2),
        "iva": round(iva, 2),
        "envio": round(envio, 2),
        "total": round(total, 2),
    }


def finalize_cart(session: Session, user: User, direccion: str, tarjeta: str) -> Purchase:
    cart = _get_active_cart(session, user)
    if not cart.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El carrito está vacío.")

    totals = calculate_totals(session, cart)

    purchase = Purchase(
        usuario_id=user.id,
        direccion=direccion,
        tarjeta=tarjeta,
        envio=totals["envio"],
        total=totals["total"],
    )

    for item in cart.items:
        product = session.get(Product, item.producto_id)
        if not product:
            continue
        if product.existencia < item.cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente para {product.titulo}",
            )
        product.existencia -= item.cantidad
        purchase.items.append(
            PurchaseItem(
                producto_id=product.id,
                nombre=product.titulo,
                cantidad=item.cantidad,
                precio_unitario=product.precio,
            )
        )

    cart.estado = "finalizado"
    cart.updated_at = datetime.utcnow()

    session.add(purchase)
    session.commit()
    session.refresh(purchase)

    # Crear nuevo carrito vacío
    new_cart = Cart(usuario_id=user.id)
    session.add(new_cart)
    session.commit()

    return purchase

