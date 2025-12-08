from fastapi import APIRouter, Depends, HTTPException, Body, status
from pydantic import BaseModel, Field
from sqlmodel import select
from ..database import get_session
from models import Carrito, CarritoItem, Producto, Compra, CompraItem
from ..deps import get_current_user

router = APIRouter(prefix="/carrito", tags=["carrito"])

class CheckoutPayload(BaseModel):
    direccion: str = Field(min_length=3)
    tarjeta: str = Field(min_length=4, description="Solo para demo; no almacenar en prod")

def _calcular_totales(carrito: Carrito):
    detalles = []
    subtotal = 0.0
    iva_total = 0.0
    for it in carrito.items:
        if not it.producto:
            continue
        precio = float(it.producto.precio)
        cant = int(it.cantidad)
        sub = precio * cant
        subtotal += sub
        # IVA: 10% para electrónica, 21% resto
        categoria = (it.producto.categoria or "").lower()
        iva_rate = 0.10 if "electro" in categoria else 0.21
        iva = round(sub * iva_rate, 2)
        iva_total += iva
        detalles.append({
            "id": it.id,
            "producto_id": it.producto_id,
            "titulo": it.producto.titulo,
            "cantidad": cant,
            "precio": precio,
            "subtotal": round(sub, 2),
            "iva": iva,
            "iva_rate": iva_rate,
        })
    total = round(subtotal + iva_total, 2)
    envio = 0.0 if total > 1000 else 50.0
    total_final = round(total + envio, 2)
    return detalles, round(subtotal, 2), round(iva_total, 2), envio, total, total_final


@router.get("")
def ver_carrito(current=Depends(get_current_user)):
    with get_session() as session:
        carrito = session.exec(select(Carrito).where(Carrito.usuario_id == current.id)).first()
        if not carrito or not carrito.items:
            return {"items": [], "subtotal": 0, "iva": 0, "envio": 0, "total": 0, "total_final": 0}
        detalles, subtotal, iva_total, envio, total, total_final = _calcular_totales(carrito)
        return {
            "items": detalles,
            "subtotal": subtotal,
            "iva": iva_total,
            "envio": envio,
            "total": total,
            "total_final": total_final,
        }

@router.post("", status_code=status.HTTP_201_CREATED)
def agregar_item(data: dict = Body(...), current=Depends(get_current_user)):
    producto_id = data.get("producto_id")
    cantidad = int(data.get("cantidad", 1))
    if not producto_id:
        raise HTTPException(status_code=400, detail="producto_id requerido")
    if cantidad < 1:
        raise HTTPException(status_code=400, detail="cantidad debe ser >= 1")
    with get_session() as session:
        producto = session.get(Producto, producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no existe")
        if producto.existencia is not None and int(producto.existencia) < cantidad:
            raise HTTPException(status_code=400, detail="Sin stock suficiente")
        carrito = session.exec(select(Carrito).where(Carrito.usuario_id == current.id)).first()
        if not carrito:
            carrito = Carrito(usuario_id=current.id)
            session.add(carrito)
            session.commit()
            session.refresh(carrito)
        # buscar item existente
        item = session.exec(select(CarritoItem).where(CarritoItem.carrito_id == carrito.id, CarritoItem.producto_id == producto_id)).first()
        if item:
            item.cantidad += cantidad
        else:
            item = CarritoItem(carrito_id=carrito.id, producto_id=producto_id, cantidad=cantidad)
            session.add(item)
        session.commit()
        session.refresh(item)
        return {"message": "Item agregado", "item_id": item.id}

# Compat: mantener endpoint antiguo
@router.post("/agregar")
def agregar_item_legacy(data: dict = Body(...), current=Depends(get_current_user)):
    return agregar_item(data, current)

@router.post("/finalizar")
def finalizar_compra(payload: CheckoutPayload = Body(...), current=Depends(get_current_user)):
    with get_session() as session:
        carrito = session.exec(select(Carrito).where(Carrito.usuario_id == current.id)).first()
        if not carrito or not carrito.items:
            raise HTTPException(status_code=400, detail="Carrito vacío")
        # Revalidar stock antes de confirmar
        for it in carrito.items:
            if not it.producto:
                continue
            existencia = int(it.producto.existencia or 0)
            if existencia < int(it.cantidad):
                raise HTTPException(status_code=400, detail=f"Producto {it.producto_id} sin stock suficiente")

        # Calcular totales con IVA/envío
        detalles, subtotal, iva_total, envio, total, total_final = _calcular_totales(carrito)

        compra = Compra(usuario_id=current.id, total=total_final)
        session.add(compra)
        session.commit()
        session.refresh(compra)

        for it in carrito.items:
            if not it.producto:
                continue
            # Descontar stock
            it.producto.existencia = int(it.producto.existencia or 0) - int(it.cantidad)
            # Crear item de compra (snapshot de precio)
            ci = CompraItem(
                compra_id=compra.id,
                producto_id=it.producto_id,
                cantidad=it.cantidad,
                precio_unitario=it.producto.precio,
            )
            session.add(ci)
        # Vaciar carrito
        for it in list(carrito.items):
            session.delete(it)
        session.commit()
        return {
            "compra_id": compra.id,
            "subtotal": subtotal,
            "iva": iva_total,
            "envio": envio,
            "total": total,
            "total_final": total_final,
            "direccion": payload.direccion,
        }

@router.post("/cancelar")
def cancelar_carrito(current=Depends(get_current_user)):
    with get_session() as session:
        carrito = session.exec(select(Carrito).where(Carrito.usuario_id == current.id)).first()
        if not carrito:
            return {"message": "Carrito inexistente"}
        for it in list(carrito.items):
            session.delete(it)
        session.commit()
        return {"message": "Carrito vaciado"}


@router.delete("/{producto_id}")
def eliminar_item(producto_id: int, current=Depends(get_current_user)):
    with get_session() as session:
        carrito = session.exec(select(Carrito).where(Carrito.usuario_id == current.id)).first()
        if not carrito:
            raise HTTPException(status_code=404, detail="Carrito no encontrado")
        item = session.exec(
            select(CarritoItem).where(
                CarritoItem.carrito_id == carrito.id,
                CarritoItem.producto_id == producto_id,
            )
        ).first()
        if not item:
            raise HTTPException(status_code=404, detail="Item no encontrado en el carrito")
        session.delete(item)
        session.commit()
        return {"message": "Item eliminado"}
