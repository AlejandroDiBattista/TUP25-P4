import unicodedata

from sqlmodel import Session, select

from app.models import Carrito, Compra, ItemCarrito, ItemCompra, Producto
from app.schemas.carrito import CarritoRead, CheckoutResponse, ItemCarritoRead


class CarritoCerradoError(Exception):
    pass


class ProductoNoEncontradoError(Exception):
    pass


class StockInsuficienteError(Exception):
    pass


class ItemCarritoNoEncontradoError(Exception):
    pass


class CarritoVacioError(Exception):
    pass


def get_or_create_active_cart(session: Session, usuario_id: int) -> Carrito:
    statement = (
        select(Carrito)
        .where(Carrito.usuario_id == usuario_id, Carrito.estado == "abierto")
        .limit(1)
    )
    carrito = session.exec(statement).first()
    if carrito:
        return carrito

    carrito = Carrito(usuario_id=usuario_id)
    session.add(carrito)
    session.commit()
    session.refresh(carrito)
    return carrito


def build_cart_summary(session: Session, carrito: Carrito) -> CarritoRead:
    statement = (
        select(ItemCarrito, Producto)
        .join(Producto, ItemCarrito.producto_id == Producto.id)
        .where(ItemCarrito.carrito_id == carrito.id)
        .order_by(Producto.nombre)
    )
    items_data = session.exec(statement).all()

    items: list[ItemCarritoRead] = []
    total = 0.0

    for item, producto in items_data:
        subtotal = producto.precio * item.cantidad
        total += subtotal
        items.append(
            ItemCarritoRead(
                producto_id=producto.id,
                nombre=producto.nombre,
                precio=producto.precio,
                cantidad=item.cantidad,
                subtotal=round(subtotal, 2),
                imagen=getattr(producto, "imagen", None),
            )
        )

    return CarritoRead(
        id=carrito.id,
        estado=carrito.estado,
        total=round(total, 2),
        items=items,
    )


def get_cart_summary(session: Session, usuario_id: int) -> CarritoRead:
    carrito = get_or_create_active_cart(session, usuario_id)
    session.refresh(carrito)
    return build_cart_summary(session, carrito)


def add_item_to_cart(
    session: Session,
    usuario_id: int,
    producto_id: int,
    cantidad: int,
) -> CarritoRead:
    carrito = get_or_create_active_cart(session, usuario_id)
    session.refresh(carrito)

    if carrito.estado != "abierto":
        raise CarritoCerradoError("El carrito no está disponible para modificaciones")

    producto = session.get(Producto, producto_id)
    if not producto:
        raise ProductoNoEncontradoError("Producto no encontrado")

    if producto.existencia <= 0:
        raise StockInsuficienteError("El producto está agotado")

    item = session.get(ItemCarrito, (carrito.id, producto_id))
    nueva_cantidad = cantidad if item is None else item.cantidad + cantidad

    if nueva_cantidad > producto.existencia:
        raise StockInsuficienteError("No hay stock suficiente para la cantidad solicitada")

    if item is None:
        item = ItemCarrito(carrito_id=carrito.id, producto_id=producto_id, cantidad=cantidad)
        session.add(item)
    else:
        item.cantidad = nueva_cantidad

    session.commit()
    session.refresh(carrito)

    return build_cart_summary(session, carrito)


def remove_item_from_cart(
    session: Session,
    usuario_id: int,
    producto_id: int,
) -> CarritoRead:
    carrito = get_or_create_active_cart(session, usuario_id)
    session.refresh(carrito)

    if carrito.estado != "abierto":
        raise CarritoCerradoError("El carrito no está disponible para modificaciones")

    item = session.get(ItemCarrito, (carrito.id, producto_id))
    if not item:
        raise ItemCarritoNoEncontradoError("El producto no está en el carrito")

    session.delete(item)
    session.commit()
    session.refresh(carrito)

    return build_cart_summary(session, carrito)


def cancel_cart(session: Session, usuario_id: int) -> CarritoRead:
    carrito = get_or_create_active_cart(session, usuario_id)
    session.refresh(carrito)

    if carrito.estado != "abierto":
        raise CarritoCerradoError("El carrito no está disponible para modificaciones")

    statement = select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)
    items = session.exec(statement).all()
    for item in items:
        session.delete(item)

    session.commit()
    session.refresh(carrito)

    return build_cart_summary(session, carrito)


def finalize_cart(
    session: Session,
    usuario_id: int,
    direccion: str,
    tarjeta: str,
) -> CheckoutResponse:
    carrito = get_or_create_active_cart(session, usuario_id)
    session.refresh(carrito)

    if carrito.estado != "abierto":
        raise CarritoCerradoError("El carrito no está disponible para modificaciones")

    statement = (
        select(ItemCarrito, Producto)
        .join(Producto, ItemCarrito.producto_id == Producto.id)
        .where(ItemCarrito.carrito_id == carrito.id)
    )
    items = session.exec(statement).all()

    if not items:
        raise CarritoVacioError("El carrito está vacío")

    lineas: list[tuple[ItemCarrito, Producto]] = []
    subtotal_raw = 0.0
    iva_raw = 0.0

    for item, producto in items:
        if item.cantidad > producto.existencia:
            raise StockInsuficienteError("No hay stock suficiente para completar la compra")

        line_subtotal = producto.precio * item.cantidad
        subtotal_raw += line_subtotal
        tasa_iva = 0.10 if _es_categoria_electronica(producto.categoria) else 0.21
        iva_raw += line_subtotal * tasa_iva
        lineas.append((item, producto))

    envio = 0.0 if subtotal_raw >= 1000 else 50.0
    subtotal = round(subtotal_raw, 2)
    iva = round(iva_raw, 2)
    total = round(subtotal + iva + envio, 2)

    compra = Compra(
        usuario_id=usuario_id,
        direccion=direccion,
        tarjeta=tarjeta,
        total=total,
        envio=envio,
    )
    session.add(compra)
    session.flush()

    for item, producto in lineas:
        producto.existencia -= item.cantidad
        session.add(
            ItemCompra(
                compra_id=compra.id,
                producto_id=producto.id,
                nombre=producto.nombre,
                precio_unitario=producto.precio,
                cantidad=item.cantidad,
            )
        )
        session.delete(item)

    carrito.estado = "finalizado"
    session.commit()
    session.refresh(compra)

    return CheckoutResponse(
        compra_id=compra.id,
        subtotal=subtotal,
        iva=iva,
        envio=envio,
        total=total,
    )


def _es_categoria_electronica(categoria: str) -> bool:
    normalizado = unicodedata.normalize("NFKD", categoria)
    plano = "".join(caracter for caracter in normalizado if not unicodedata.combining(caracter)).lower()
    return "electro" in plano
