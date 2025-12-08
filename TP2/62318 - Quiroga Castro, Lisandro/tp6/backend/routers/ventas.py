from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from datetime import datetime
from pydantic import BaseModel
from backend.database import engine
from backend.models.cart import Cart, CartItem
from backend.models.order import Order, OrderItem
from typing import List, Dict
from sqlmodel import select
from backend.routers.productos import cargar_productos
from fastapi import HTTPException
import json
import os

router = APIRouter(prefix="/ventas")

def get_session():
    with Session(engine) as session:
        yield session

class FinalizarPayload(BaseModel):
    direccion: str
    tarjeta: str

@router.post("/finalizar/{usuario_id}")
def finalizar_compra(
    usuario_id: int,
    payload: FinalizarPayload,
    session: Session = Depends(get_session)
):
    
    # buscar carrito abierto del usuario
    carrito = session.exec(
        select(Cart).where(Cart.usuario_id == usuario_id, Cart.estado == "abierto")
    ).first()

    if not carrito:
        raise HTTPException(status_code=400, detail="El usuario no tiene carrito abierto")

    items = session.exec(
        select(CartItem).where(CartItem.carrito_id == carrito.id)
    ).all()

    if not items:
        raise HTTPException(status_code=400, detail="El carrito está vacío")

    # cargar productos desde el JSON para obtener precios y títulos
    productos = cargar_productos()

    total = 0.0
    order_items = []

    for item in items:
        # buscar producto por id
        producto = next((p for p in productos if p["id"] == item.producto_id), None)
        if producto:
            precio_unitario = float(producto.get("precio", 0))
            nombre = producto.get("titulo", "Producto")
        else:
            # si no encontramos el producto en el JSON, usamos 0 y nombre genérico
            precio_unitario = 0.0
            nombre = "Producto"

        subtotal = precio_unitario * item.cantidad
        total += subtotal

        order_items.append({
            "producto_id": item.producto_id,
            "cantidad": item.cantidad,
            "nombre": nombre,
            "precio_unitario": precio_unitario
        })

    envio = 0 if total >= 1000 else 50

    orden = Order(
        usuario_id=usuario_id,
        fecha=datetime.now().strftime("%Y-%m-%d %H:%M"),
        direccion=payload.direccion,
        tarjeta=payload.tarjeta[-4:] if payload.tarjeta else "",
        total=total,
        envio=envio
    )

    session.add(orden)
    session.commit()
    session.refresh(orden)

    # crear OrderItem para cada item del carrito
    for oi in order_items:
        nuevo_item = OrderItem(
            compra_id=orden.id,
            producto_id=oi["producto_id"],
            cantidad=oi["cantidad"],
            nombre=oi["nombre"],
            precio_unitario=oi["precio_unitario"]
        )
        session.add(nuevo_item)

    # marcar carrito como finalizado y borrar los CartItem
    carrito.estado = "finalizado"

    for item in items:
        session.delete(item)

    session.commit()

    return {"mensaje": "Compra finalizada", "orden_id": orden.id, "total": total}


@router.get("/historial/{usuario_id}")
def obtener_historial(usuario_id: int, session: Session = Depends(get_session)):

    # Obtener todas las órdenes del usuario
    ordenes = session.exec(
        select(Order).where(Order.usuario_id == usuario_id)
    ).all()

    if not ordenes:
        return {"historial": []}

    historial = []

    for orden in ordenes:
        # Obtener ítems de la orden
        items = session.exec(
            select(OrderItem).where(OrderItem.compra_id == orden.id)
        ).all()

        # Formatear ítems para enviarlos al frontend
        items_out = [
            {
                "id": it.id,
                "producto_id": it.producto_id,
                "cantidad": it.cantidad,
                "nombre": it.nombre,
                "precio_unitario": it.precio_unitario,
            }
            for it in items
        ]

        historial.append({
            "orden_id": orden.id,
            "fecha": orden.fecha,
            "direccion": orden.direccion,
            "tarjeta": orden.tarjeta,
            "total": orden.total,
            "envio": orden.envio,
            "items": items_out
        })

    return {"historial": historial}

