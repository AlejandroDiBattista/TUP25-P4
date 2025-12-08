from collections.abc import Iterable

from sqlmodel import Session, select

from app.models import Compra, ItemCompra
from app.schemas.compra import CompraDetalle, CompraResumen, ItemCompraRead


class CompraNoEncontradaError(Exception):
    pass


def listar_compras(session: Session, usuario_id: int) -> list[CompraResumen]:
    statement = (
        select(Compra)
        .where(Compra.usuario_id == usuario_id)
        .order_by(Compra.fecha.desc())
    )
    compras = session.exec(statement).all()

    resultados: list[CompraResumen] = []
    for compra in compras:
        items = _obtener_items(session, compra.id)
        resumen = _construir_resumen(compra, items)
        resultados.append(resumen)

    return resultados


def obtener_compra(session: Session, usuario_id: int, compra_id: int) -> CompraDetalle:
    compra = session.get(Compra, compra_id)
    if not compra or compra.usuario_id != usuario_id:
        raise CompraNoEncontradaError("Compra no encontrada")

    items = _obtener_items(session, compra.id)
    resumen = _construir_resumen(compra, items)
    return CompraDetalle(**resumen.dict(), items=_construir_items(items))


def _obtener_items(session: Session, compra_id: int) -> Iterable[ItemCompra]:
    statement = select(ItemCompra).where(ItemCompra.compra_id == compra_id)
    return session.exec(statement).all()


def _construir_items(items: Iterable[ItemCompra]) -> list[ItemCompraRead]:
    resultado: list[ItemCompraRead] = []
    for item in items:
        subtotal = round(item.precio_unitario * item.cantidad, 2)
        resultado.append(
            ItemCompraRead(
                producto_id=item.producto_id,
                nombre=item.nombre,
                precio_unitario=item.precio_unitario,
                cantidad=item.cantidad,
                subtotal=subtotal,
            )
        )
    return resultado


def _construir_resumen(
    compra: Compra,
    items: Iterable[ItemCompra],
) -> CompraResumen:
    subtotal = 0.0
    cantidad_items = 0
    for item in items:
        subtotal += item.precio_unitario * item.cantidad
        cantidad_items += item.cantidad

    subtotal = round(subtotal, 2)
    iva = round(compra.total - compra.envio - subtotal, 2)

    return CompraResumen(
        id=compra.id,
        fecha=compra.fecha,
        subtotal=subtotal,
        iva=iva,
        envio=compra.envio,
        total=compra.total,
        cantidad_items=cantidad_items,
    )
