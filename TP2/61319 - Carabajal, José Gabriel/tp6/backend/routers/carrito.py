from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import Annotated, List, Dict, Any
from datetime import datetime

from db import get_session
from models.carrito import Carrito, CarritoItem
from models.compras import Compra, CompraItem
from schemas.cart import CartAddIn, CartView, CartViewItem, CartTotals, FinalizarCompraIn
from schemas.compras import CompraOut, CompraItemOut
from utils.products import (
    cargar_productos,
    get_stock,
    restar_stock,
)

router = APIRouter(prefix="/carrito", tags=["carrito"])


# ---------------- Helpers ----------------
def get_or_create_cart(session: Session, usuario_id: int) -> Carrito:
    cart = session.exec(
        select(Carrito).where(Carrito.usuario_id == usuario_id, Carrito.estado == "abierto")
    ).first()
    if not cart:
        cart = Carrito(usuario_id=usuario_id, estado="abierto")
        session.add(cart)
        session.commit()
        session.refresh(cart)
    return cart


def buscar_producto(prod_list: List[Dict[str, Any]], producto_id: int) -> Dict[str, Any]:
    for p in prod_list:
        if int(p["id"]) == int(producto_id):
            return p
    raise HTTPException(status_code=404, detail="Producto no encontrado")


def calcular_totales(items: List[CartViewItem]) -> CartTotals:
    subtotal = sum(i.precio_unitario * i.cantidad for i in items)
    return CartTotals(subtotal=subtotal, iva=0.0, envio=0.0, total=subtotal)


def build_cart_view(session: Session, cart: Carrito) -> CartView:
    productos = cargar_productos()
    view_items: List[CartViewItem] = []
    iva_sum = 0.0

    for it in cart.items:
        p = buscar_producto(productos, it.producto_id)
        precio = float(p["precio"])
        nombre = p["titulo"]
        categoria = p["categoria"]
        imagen = p["imagen"]

        # IVA por ítem
        tasa = 0.10 if "electr" in categoria.lower() else 0.21
        iva_sum += precio * it.cantidad * tasa

        # --- info de stock para el front ---
        stock_total = get_stock(it.producto_id)
        stock_restante = max(stock_total - it.cantidad, 0)
        max_cantidad = stock_total

        view_items.append(
            CartViewItem(
                producto_id=it.producto_id,
                nombre=nombre,
                precio_unitario=precio,
                cantidad=it.cantidad,
                imagen=imagen,
                stock_disponible=stock_restante,
                max_cantidad=max_cantidad,
            )
        )

    totals = calcular_totales(view_items)
    subtotal = totals.subtotal
    envio = 0.0 if subtotal > 1000 else 50.0
    total = subtotal + iva_sum + envio

    return CartView(
        estado=cart.estado,
        items=view_items,
        totals=CartTotals(
            subtotal=round(subtotal, 2),
            iva=round(iva_sum, 2),
            envio=round(envio, 2),
            total=round(total, 2),
        ),
    )


# ---------------- Endpoints ----------------
@router.get("", response_model=CartView)
def ver_carrito(usuario_id: int, session: Annotated[Session, Depends(get_session)]):
    cart = get_or_create_cart(session, usuario_id)
    return build_cart_view(session, cart)


@router.post("", response_model=CartView, status_code=201)
def agregar_al_carrito(data: CartAddIn, usuario_id: int, session: Annotated[Session, Depends(get_session)]):
    cart = get_or_create_cart(session, usuario_id)

    stock_total = get_stock(data.producto_id)
    if stock_total <= 0:
        raise HTTPException(status_code=400, detail="Producto sin stock")

    item = session.exec(
        select(CarritoItem).where(CarritoItem.carrito_id == cart.id, CarritoItem.producto_id == data.producto_id)
    ).first()

    agregar = max(1, data.cantidad)

    if item:
        if item.cantidad + agregar > stock_total:
            raise HTTPException(status_code=400, detail="No hay stock suficiente")
        item.cantidad += agregar
    else:
        if agregar > stock_total:
            raise HTTPException(status_code=400, detail="No hay stock suficiente")
        item = CarritoItem(carrito_id=cart.id, producto_id=data.producto_id, cantidad=agregar)
        session.add(item)

    session.commit()
    session.refresh(cart)
    return build_cart_view(session, cart)


@router.delete("/{producto_id}", response_model=CartView)
def quitar_del_carrito(producto_id: int, usuario_id: int, session: Annotated[Session, Depends(get_session)]):
    cart = get_or_create_cart(session, usuario_id)
    item = session.exec(
        select(CarritoItem).where(CarritoItem.carrito_id == cart.id, CarritoItem.producto_id == producto_id)
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="El producto no está en el carrito")
    session.delete(item)
    session.commit()
    return build_cart_view(session, cart)


@router.post("/cancelar", response_model=CartView)
def cancelar_carrito(usuario_id: int, session: Annotated[Session, Depends(get_session)]):
    cart = get_or_create_cart(session, usuario_id)
    cart.estado = "cancelado"
    for it in list(cart.items):
        session.delete(it)
    session.commit()
    return build_cart_view(session, cart)


@router.post("/finalizar", response_model=CompraOut)
def finalizar_compra(data: FinalizarCompraIn, usuario_id: int, session: Annotated[Session, Depends(get_session)]):
    cart = get_or_create_cart(session, usuario_id)
    if not cart.items:
        raise HTTPException(status_code=400, detail="El carrito está vacío")

    view = build_cart_view(session, cart)

    compra = Compra(
        usuario_id=usuario_id,
        fecha=datetime.utcnow(),
        direccion=data.direccion,
        tarjeta=data.tarjeta[-4:],  
        subtotal=view.totals.subtotal,
        iva=view.totals.iva,
        envio=view.totals.envio,
        total=view.totals.total,
    )
    session.add(compra)
    session.commit()
    session.refresh(compra)

    productos = cargar_productos()
    for it in cart.items:
        p = buscar_producto(productos, it.producto_id)
        precio = float(p["precio"])
        categoria = p["categoria"]
        tasa = 0.10 if "electr" in categoria.lower() else 0.21
        line_base = precio * it.cantidad
        line_iva = round(line_base * tasa, 2)

        session.add(
            CompraItem(
                compra_id=compra.id,
                producto_id=it.producto_id,
                nombre=p["titulo"],
                precio_unitario=precio,
                cantidad=it.cantidad,
                iva=line_iva,
            )
        )

        # Descontar stock real
        restar_stock(it.producto_id, it.cantidad)

    # cerrar carrito y vaciar
    cart.estado = "finalizado"
    for it in list(cart.items):
        session.delete(it)
    session.commit()

    items_out = [
        CompraItemOut(
            producto_id=ci.producto_id,
            nombre=ci.nombre,
            precio_unitario=ci.precio_unitario,
            cantidad=ci.cantidad,
            iva=getattr(ci, "iva", None),
        )
        for ci in session.exec(select(CompraItem).where(CompraItem.compra_id == compra.id)).all()
    ]

    return CompraOut(
        id=compra.id,
        fecha=compra.fecha,
        subtotal=compra.subtotal,
        iva=compra.iva,
        envio=compra.envio,
        total=compra.total,
        items=items_out,
    )
