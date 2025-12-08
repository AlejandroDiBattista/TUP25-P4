from fastapi import APIRouter, HTTPException, Depends, Header
from sqlmodel import select
from db import get_session
from models import Usuario, Producto, Carrito, CarritoItem, Compra, CompraItem
from schemas import AddCarritoSchema, CarritoOut, CarritoItemOut, FinalizarSchema
import auth as _auth

router = APIRouter()

def get_user_from_token(authorization: str = Header(...)):
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Token inválido")
    token = parts[1]
    if _auth.is_token_blacklisted(token):
        raise HTTPException(status_code=401, detail="Token invalidado")
    payload = _auth.decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    return payload

def calcular_iva(precio: float, categoria: str):
    if "electr" in (categoria or "").lower():
        return round(precio * 0.10, 2)
    return round(precio * 0.21, 2)

@router.get("/", response_model=CarritoOut)
def ver_carrito(authorization: str = Header(...)):
    payload = get_user_from_token(authorization)
    user_id = int(payload.get("sub"))
    session = get_session()
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == user_id, Carrito.estado == "activo")).first()
    if not carrito:
        carrito = Carrito(usuario_id=user_id)
        session.add(carrito)
        session.commit()
        session.refresh(carrito)
    items = session.exec(select(CarritoItem).where(CarritoItem.carrito_id == carrito.id)).all()
    detalle_items = []
    subtotal = 0.0
    iva_total = 0.0
    for it in items:
        prod = session.get(Producto, it.producto_id)
        subtotal_item = prod.precio * it.cantidad
        iva = calcular_iva(subtotal_item, prod.categoria)
        detalle_items.append({
            "producto_id": prod.id,
            "nombre": prod.nombre,
            "precio_unitario": prod.precio,
            "cantidad": it.cantidad,
            "subtotal": round(subtotal_item,2),
            "iva": iva
        })
        subtotal += subtotal_item
        iva_total += iva
    envio = 0 if subtotal > 1000 else 50
    total = round(subtotal + iva_total + envio, 2)
    return {
        "items": detalle_items,
        "subtotal": round(subtotal,2),
        "iva_total": round(iva_total,2),
        "envio": envio,
        "total": total
    }

@router.post("/", status_code=201)
def agregar_al_carrito(payload: AddCarritoSchema, authorization: str = Header(...)):
    user_payload = get_user_from_token(authorization)
    user_id = int(user_payload.get("sub"))
    session = get_session()
    producto = session.get(Producto, payload.producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if producto.existencia <= 0:
        raise HTTPException(status_code=400, detail="Producto Agotado")
    if payload.cantidad <= 0:
        raise HTTPException(status_code=400, detail="Cantidad inválida")
    if payload.cantidad > producto.existencia:
        raise HTTPException(status_code=400, detail="No hay suficiente existencia")
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == user_id, Carrito.estado == "activo")).first()
    if not carrito:
        carrito = Carrito(usuario_id=user_id)
        session.add(carrito)
        session.commit()
        session.refresh(carrito)
    existing = session.exec(select(CarritoItem).where(CarritoItem.carrito_id == carrito.id, CarritoItem.producto_id == producto.id)).first()
    if existing:
        new_cant = existing.cantidad + payload.cantidad
        if new_cant > producto.existencia:
            raise HTTPException(status_code=400, detail="No hay suficiente existencia")
        existing.cantidad = new_cant
        session.add(existing)
    else:
        item = CarritoItem(carrito_id=carrito.id, producto_id=producto.id, cantidad=payload.cantidad)
        session.add(item)
    session.commit()
    return {"detail": "Producto agregado"}

@router.delete("/{product_id}")
def quitar_del_carrito(product_id: int, authorization: str = Header(...)):
    payload = get_user_from_token(authorization)
    user_id = int(payload.get("sub"))
    session = get_session()
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == user_id, Carrito.estado == "activo")).first()
    if not carrito:
        raise HTTPException(status_code=404, detail="Carrito no encontrado")
    item = session.exec(select(CarritoItem).where(CarritoItem.carrito_id == carrito.id, CarritoItem.producto_id == product_id)).first()
    if not item:
        raise HTTPException(status_code=404, detail="Producto no en carrito")
    session.delete(item)
    session.commit()
    return {"detail": "Producto eliminado"}

@router.post("/cancelar")
def cancelar_carrito(authorization: str = Header(...)):
    payload = get_user_from_token(authorization)
    user_id = int(payload.get("sub"))
    session = get_session()
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == user_id, Carrito.estado == "activo")).first()
    if not carrito:
        return {"detail": "Carrito vacío"}
    items = session.exec(select(CarritoItem).where(CarritoItem.carrito_id == carrito.id)).all()
    for it in items:
        session.delete(it)
    session.commit()
    return {"detail": "Carrito cancelado"}

@router.post("/finalizar")
def finalizar_compra(data: FinalizarSchema, authorization: str = Header(...)):
    payload = get_user_from_token(authorization)
    user_id = int(payload.get("sub"))
    session = get_session()
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == user_id, Carrito.estado == "activo")).first()
    if not carrito:
        raise HTTPException(status_code=400, detail="Carrito vacío")
    items = session.exec(select(CarritoItem).where(CarritoItem.carrito_id == carrito.id)).all()
    if not items:
        raise HTTPException(status_code=400, detail="Carrito vacío")
    subtotal = 0.0
    iva_total = 0.0
    # verify stock
    for it in items:
        prod = session.get(Producto, it.producto_id)
        if not prod:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        if it.cantidad > prod.existencia:
            raise HTTPException(status_code=400, detail=f"No hay suficiente existencia para {prod.nombre}")
        subtotal += prod.precio * it.cantidad
        iva_total += (prod.precio * it.cantidad * (0.10 if "electr" in (prod.categoria or "").lower() else 0.21))
    envio = 0 if subtotal > 1000 else 50
    total = round(subtotal + iva_total + envio, 2)
    compra = Compra(usuario_id=user_id, direccion=data.direccion, tarjeta=data.tarjeta, total=total, envio=envio)
    session.add(compra)
    session.commit()
    session.refresh(compra)
    # create items and deduct stock
    for it in items:
        prod = session.get(Producto, it.producto_id)
        compra_item = CompraItem(compra_id=compra.id, producto_id=prod.id, cantidad=it.cantidad, nombre=prod.nombre, precio_unitario=prod.precio)
        session.add(compra_item)
        prod.existencia -= it.cantidad
        session.delete(it)
        session.add(prod)
    carrito.estado = "finalizado"
    session.add(carrito)
    session.commit()
    return {"compra_id": compra.id}
