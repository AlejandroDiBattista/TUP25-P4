from __future__ import annotations

from datetime import datetime
from typing import Iterable

from fastapi import HTTPException, status
from sqlmodel import Session, select

from models import Carrito, CarritoItem, Compra, CompraItem, EstadoCarrito, Producto, Usuario
from schemas.carrito import CarritoAgregar, CarritoDetalle, CarritoItemDetalle
from schemas.compra import CompraDetalle

IVA_GENERAL = 0.21
IVA_ELECTRONICA = 0.10
COSTO_ENVIO = 50.0
MONTO_ENVIO_GRATIS = 1000.0


def _normalizar_categoria(categoria: str) -> str:
    return categoria.strip().lower()


def obtener_o_crear_carrito_activo(*, usuario: Usuario, session: Session) -> Carrito:
    consulta = (
        select(Carrito)
        .where(Carrito.usuario_id == usuario.id)
        .where(Carrito.estado == EstadoCarrito.ABIERTO)
        .order_by(Carrito.creado_en.desc())
    )
    carrito = session.exec(consulta).first()
    if carrito is None:
        carrito = Carrito(usuario_id=usuario.id)
        session.add(carrito)
        session.commit()
        session.refresh(carrito)
    return carrito


def _cargar_items_con_productos(session: Session, carrito_id: int) -> Iterable[tuple[CarritoItem, Producto]]:
    consulta = (
        select(CarritoItem, Producto)
        .join(Producto, CarritoItem.producto_id == Producto.id)
        .where(CarritoItem.carrito_id == carrito_id)
    )
    return session.exec(consulta)


def serializar_carrito(*, carrito: Carrito, session: Session) -> CarritoDetalle:
    items_consulta = list(_cargar_items_con_productos(session, carrito.id))
    subtotal = 0.0
    iva = 0.0
    total_items = 0
    vista_items: list[CarritoItemDetalle] = []

    for item, producto in items_consulta:
        subtotal_item = producto.precio * item.cantidad
        subtotal += subtotal_item
        total_items += item.cantidad

        categoria_normalizada = _normalizar_categoria(producto.categoria)
        tasa_iva = IVA_ELECTRONICA if "electr" in categoria_normalizada else IVA_GENERAL
        iva += subtotal_item * tasa_iva

        vista_items.append(
            CarritoItemDetalle(
                producto_id=producto.id,
                nombre=producto.nombre,
                cantidad=item.cantidad,
                precio_unitario=producto.precio,
                subtotal=round(subtotal_item, 2),
                categoria=producto.categoria,
                imagen=producto.imagen,
                valoracion=producto.valoracion,
            )
        )

    envio = 0.0 if subtotal > MONTO_ENVIO_GRATIS else (COSTO_ENVIO if subtotal else 0.0)
    total = subtotal + iva + envio

    return CarritoDetalle(
        id=carrito.id,
        estado=carrito.estado.value,
        total_items=total_items,
        subtotal=round(subtotal, 2),
        iva=round(iva, 2),
        envio=round(envio, 2),
        total=round(total, 2),
        items=vista_items,
    )


def agregar_producto(*, carrito: Carrito, payload: CarritoAgregar, session: Session) -> CarritoDetalle:
    producto = session.get(Producto, payload.producto_id)
    if producto is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

    if producto.existencia <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Producto sin stock disponible")

    consulta_item = select(CarritoItem).where(
        CarritoItem.carrito_id == carrito.id, CarritoItem.producto_id == producto.id
    )
    item = session.exec(consulta_item).first()

    cantidad_total = payload.cantidad
    if item is not None:
        cantidad_total += item.cantidad

    if cantidad_total > producto.existencia:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Stock insuficiente")

    if item is None:
        item = CarritoItem(carrito_id=carrito.id, producto_id=producto.id, cantidad=payload.cantidad)
        session.add(item)
    else:
        item.cantidad = cantidad_total

    carrito.actualizado_en = datetime.utcnow()
    session.add(carrito)
    session.commit()
    session.refresh(carrito)

    return serializar_carrito(carrito=carrito, session=session)


def quitar_producto(*, carrito: Carrito, producto_id: int, session: Session) -> CarritoDetalle:
    consulta_item = select(CarritoItem).where(
        CarritoItem.carrito_id == carrito.id, CarritoItem.producto_id == producto_id
    )
    item = session.exec(consulta_item).first()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El producto no está en el carrito")

    session.delete(item)
    session.commit()

    carrito.actualizado_en = datetime.utcnow()
    session.add(carrito)
    session.commit()

    return serializar_carrito(carrito=carrito, session=session)


def cancelar_carrito(*, carrito: Carrito, session: Session) -> CarritoDetalle:
    if carrito.estado != EstadoCarrito.ABIERTO:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El carrito ya está cerrado")

    for item in list(carrito.items):
        session.delete(item)

    carrito.estado = EstadoCarrito.CANCELADO
    carrito.actualizado_en = datetime.utcnow()
    session.add(carrito)
    session.commit()

    nuevo_carrito = Carrito(usuario_id=carrito.usuario_id)
    session.add(nuevo_carrito)
    session.commit()
    session.refresh(nuevo_carrito)

    return serializar_carrito(carrito=nuevo_carrito, session=session)


def _sanear_tarjeta(tarjeta: str) -> str:
    digitos = "".join(ch for ch in tarjeta if ch.isdigit())
    if len(digitos) < 4:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Tarjeta inválida")
    return digitos[-4:]


def finalizar_compra(
    *, carrito: Carrito, direccion: str, tarjeta: str, session: Session
) -> tuple[CarritoDetalle, CompraDetalle]:
    if not carrito.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El carrito está vacío")

    if carrito.estado != EstadoCarrito.ABIERTO:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El carrito ya fue cerrado")

    items_con_productos = list(_cargar_items_con_productos(session, carrito.id))
    if not items_con_productos:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El carrito está vacío")

    # Validar stock antes de modificar nada
    for item, producto in items_con_productos:
        if item.cantidad > producto.existencia:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente para {producto.nombre}",
            )

    detalle = serializar_carrito(carrito=carrito, session=session)

    # Actualizar existencias
    for item, producto in items_con_productos:
        producto.existencia -= item.cantidad
        session.add(producto)

    carrito.estado = EstadoCarrito.FINALIZADO
    carrito.actualizado_en = datetime.utcnow()
    session.add(carrito)

    tarjeta_saneada = _sanear_tarjeta(tarjeta)

    compra = Compra(
        usuario_id=carrito.usuario_id,
        carrito_id=carrito.id,
        direccion=direccion,
        tarjeta=tarjeta_saneada,
        subtotal=detalle.subtotal,
        iva=detalle.iva,
        envio=detalle.envio,
        total=detalle.total,
    )
    session.add(compra)
    session.commit()
    session.refresh(compra)

    for vista_item in detalle.items:
        compra_item = CompraItem(
            compra_id=compra.id,
            producto_id=vista_item.producto_id,
            nombre=vista_item.nombre,
            cantidad=vista_item.cantidad,
            precio_unitario=vista_item.precio_unitario,
            categoria=vista_item.categoria,
            imagen=vista_item.imagen,
        )
        session.add(compra_item)

    # Vaciar carrito para histórico mantenido en estado finalizado
    for item, _ in items_con_productos:
        session.delete(item)

    session.commit()

    nuevo_carrito = Carrito(usuario_id=carrito.usuario_id)
    session.add(nuevo_carrito)
    session.commit()
    session.refresh(nuevo_carrito)

    vista_compra = CompraDetalle(
        id=compra.id,
        fecha=compra.fecha,
        total=compra.total,
        envio=compra.envio,
        subtotal=compra.subtotal,
        iva=compra.iva,
        direccion=compra.direccion,
        items=list(detalle.items),
    )

    return serializar_carrito(carrito=nuevo_carrito, session=session), vista_compra
