from typing import Optional

from sqlmodel import Session, select

from . import models


def get_user_by_email(session: Session, email: str):
    statement = select(models.User).where(models.User.email == email)
    return session.exec(statement).first()


def create_user(session: Session, nombre: str, email: str, hashed_password: str):
    user = models.User(nombre=nombre, email=email, hashed_password=hashed_password)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def list_products(session: Session, categoria: Optional[str] = None, q: Optional[str] = None):
    statement = select(models.Product)
    if categoria:
        statement = statement.where(models.Product.categoria == categoria)
    if q:
        pattern = f"%{q}%"
        statement = statement.where(models.Product.nombre.ilike(pattern) | models.Product.descripcion.ilike(pattern))
    return session.exec(statement).all()


def get_product(session: Session, product_id: int):
    return session.get(models.Product, product_id)


def get_or_create_cart(session: Session, usuario_id: int):
    statement = select(models.Cart).where(models.Cart.usuario_id == usuario_id, models.Cart.estado == "activo")
    cart = session.exec(statement).first()
    if cart:
        return cart
    cart = models.Cart(usuario_id=usuario_id, estado="activo")
    session.add(cart)
    session.commit()
    session.refresh(cart)
    return cart


def add_item_to_cart(session: Session, cart: models.Cart, producto: models.Product, cantidad: int):
    if cart.estado != "activo":
        raise ValueError("El carrito no está activo")
    if producto.existencia <= 0:
        raise ValueError("Producto agotado")
    if cantidad <= 0:
        raise ValueError("Cantidad invalida")
    statement = select(models.CartItem).where(models.CartItem.cart_id == cart.id, models.CartItem.producto_id == producto.id)
    item = session.exec(statement).first()
    if item:
        new_cant = item.cantidad + cantidad
        if new_cant > producto.existencia:
            raise ValueError("No hay suficiente stock para la cantidad solicitada")
        item.cantidad = new_cant
        session.add(item)
    else:
        if cantidad > producto.existencia:
            raise ValueError("No hay suficiente stock para la cantidad solicitada")
        item = models.CartItem(cart_id=cart.id, producto_id=producto.id, cantidad=cantidad)
        session.add(item)
    session.commit()
    session.refresh(item)
    return item


def remove_item_from_cart(session: Session, cart: models.Cart, product_id: int):
    statement = select(models.CartItem).where(models.CartItem.cart_id == cart.id, models.CartItem.producto_id == product_id)
    item = session.exec(statement).first()
    if not item:
        raise ValueError("Item no encontrado en el carrito")
    session.delete(item)
    session.commit()
    return True


def list_cart_items(session: Session, cart: models.Cart):
    statement = select(models.CartItem).where(models.CartItem.cart_id == cart.id)
    return session.exec(statement).all()


def finalize_cart(session: Session, cart: models.Cart, direccion: str, tarjeta: str):
    if cart.estado != "activo":
        raise ValueError("El carrito ya fue finalizado o cancelado")

    items = list_cart_items(session, cart)
    if not items:
        raise ValueError("Carrito vacío")

    total_sin_iva = 0.0
    iva_total = 0.0

    purchase = models.Purchase(usuario_id=cart.usuario_id, direccion=direccion, tarjeta=tarjeta)
    session.add(purchase)
    session.commit()
    session.refresh(purchase)

    for it in items:
        producto = session.get(models.Product, it.producto_id)
        if not producto:
            raise ValueError("Producto no encontrado")
        if producto.existencia < it.cantidad:
            raise ValueError(f"No hay stock suficiente para {producto.nombre}")
        pitem = models.PurchaseItem(
            purchase_id=purchase.id,
            producto_id=producto.id,
            cantidad=it.cantidad,
            nombre=producto.nombre,
            precio_unitario=producto.precio,
        )
        session.add(pitem)
        linea_total = producto.precio * it.cantidad
        total_sin_iva += linea_total
        rate = 0.10 if producto.categoria and producto.categoria.lower().startswith("electr") else 0.21
        iva_total += linea_total * rate
        producto.existencia = producto.existencia - it.cantidad
        session.add(producto)

    total_con_iva = total_sin_iva + iva_total
    envio = 0.0 if total_con_iva >= 1000 else (50.0 if total_sin_iva > 0 else 0.0)
    total = total_sin_iva + iva_total + envio
    purchase.total = round(total, 2)
    purchase.envio = envio
    purchase.iva_total = round(iva_total, 2)
    session.add(purchase)
    cart.estado = "finalizado"
    session.add(cart)
    for it in items:
        session.delete(it)

    session.commit()
    session.refresh(purchase)
    return purchase


def cancel_cart(session: Session, cart: models.Cart):
    if cart.estado != "activo":
        raise ValueError("Solo carritos activos pueden ser cancelados")
    items = list_cart_items(session, cart)
    for it in items:
        session.delete(it)
    cart.estado = "cancelado"
    session.add(cart)
    session.commit()
    return True


def list_purchases_for_user(session: Session, usuario_id: int):
    statement = select(models.Purchase).where(models.Purchase.usuario_id == usuario_id).order_by(models.Purchase.fecha.desc())
    return session.exec(statement).all()


def get_purchase(session: Session, purchase_id: int):
    return session.get(models.Purchase, purchase_id)
