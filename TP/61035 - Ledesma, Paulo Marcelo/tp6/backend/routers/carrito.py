from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import Carrito, ItemCarrito, Producto, Usuario, Compra, ItemCompra
from routers.auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/carrito", tags=["Carrito"])

# ✅ Obtener carrito actual del usuario
@router.get("/")
def obtener_carrito(
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    carrito = db.exec(
        select(Carrito).where(Carrito.usuario_id == usuario.id, Carrito.estado == "abierto")
    ).first()

    if not carrito:
        return {"items": [], "total": 0}

    items = []
    total = 0

    for item in carrito.items:
        precio = item.producto.precio
        subtotal = item.cantidad * precio
        total += subtotal
        items.append({
            "id": item.id,
            "producto": item.producto.nombre,
            "cantidad": item.cantidad,
            "precio_unitario": precio,
            "subtotal": subtotal
        })

    return {"items": items, "total": total}


# ✅ Agregar producto al carrito
@router.post("/")
def agregar_al_carrito(
    data: dict,
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    producto_id = data.get("producto_id")
    cantidad = data.get("cantidad")

    if not producto_id or not cantidad:
        raise HTTPException(400, "Faltan campos: producto_id y cantidad son obligatorios")

    producto = db.get(Producto, producto_id)
    if not producto:
        raise HTTPException(404, "Producto no encontrado")

    if producto.existencia < cantidad:
        raise HTTPException(400, f"No hay suficiente stock de '{producto.nombre}'")

    carrito = db.exec(
        select(Carrito).where(Carrito.usuario_id == usuario.id, Carrito.estado == "abierto")
    ).first()

    if not carrito:
        carrito = Carrito(usuario_id=usuario.id, estado="abierto")
        db.add(carrito)
        db.commit()
        db.refresh(carrito)

    item = db.exec(
        select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == producto_id)
    ).first()

    if item:
        nueva_cantidad = item.cantidad + cantidad
        if producto.existencia < nueva_cantidad:
            raise HTTPException(400, f"Stock insuficiente para '{producto.nombre}'")
        item.cantidad = nueva_cantidad
    else:
        item = ItemCarrito(carrito_id=carrito.id, producto_id=producto_id, cantidad=cantidad)
        db.add(item)

    db.commit()
    db.refresh(item)
    return {"mensaje": f"Producto '{producto.nombre}' agregado al carrito correctamente"}


# ✅ NUEVO: eliminar un item del carrito (para test 4.4)
@router.delete("/{item_id}")
def eliminar_item_carrito(
    item_id: int,
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    carrito = db.exec(
        select(Carrito).where(Carrito.usuario_id == usuario.id, Carrito.estado == "abierto")
    ).first()

    if not carrito:
        raise HTTPException(400, "No hay carrito activo")

    item = db.exec(
        select(ItemCarrito).where(
            ItemCarrito.id == item_id,
            ItemCarrito.carrito_id == carrito.id
        )
    ).first()

    if not item:
        raise HTTPException(404, "El producto no está en el carrito")

    db.delete(item)
    db.commit()

    return {"mensaje": "Producto eliminado del carrito correctamente"}


# ✅ NUEVO: actualizar cantidad de un item en el carrito (PATCH)
@router.patch("/{item_id}")
def actualizar_cantidad_item(
    item_id: int,
    data: dict,
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    carrito = db.exec(
        select(Carrito).where(Carrito.usuario_id == usuario.id, Carrito.estado == "abierto")
    ).first()

    if not carrito:
        raise HTTPException(400, "No hay carrito activo")

    item = db.exec(
        select(ItemCarrito).where(
            ItemCarrito.id == item_id,
            ItemCarrito.carrito_id == carrito.id
        )
    ).first()

    if not item:
        raise HTTPException(404, "El producto no está en el carrito")

    nueva_cantidad = data.get("cantidad")
    if not nueva_cantidad or nueva_cantidad < 1:
        raise HTTPException(400, "Cantidad debe ser mayor a 0")

    # Validar stock disponible
    if item.producto.existencia < nueva_cantidad:
        raise HTTPException(400, f"Stock insuficiente para '{item.producto.nombre}'. Disponible: {item.producto.existencia}")

    item.cantidad = nueva_cantidad
    db.add(item)
    db.commit()
    db.refresh(item)

    return {"mensaje": "Cantidad actualizada correctamente", "cantidad": item.cantidad}


# ✅ NUEVO: vaciar carrito sin borrarlo (para test 4.6)
@router.post("/cancelar")
def cancelar_carrito(
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    carrito = db.exec(
        select(Carrito).where(Carrito.usuario_id == usuario.id, Carrito.estado == "abierto")
    ).first()

    if not carrito:
        raise HTTPException(400, "No hay carrito activo")

    # ✅ borrar solo los items
    for item in carrito.items:
        db.delete(item)

    db.commit()
    return {"mensaje": "Carrito vaciado correctamente"}


# ✅ Finalizar compra con reglas de negocio (SIN CAMBIOS)
@router.post("/finalizar")
def finalizar_carrito(
    data: dict,
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    direccion = data.get("direccion")
    tarjeta = data.get("tarjeta")

    if not direccion or not tarjeta:
        raise HTTPException(400, "Faltan campos: dirección y tarjeta son obligatorios")

    carrito = db.exec(
        select(Carrito).where(Carrito.usuario_id == usuario.id, Carrito.estado == "abierto")
    ).first()

    if not carrito or not carrito.items:
        raise HTTPException(400, "El carrito está vacío")

    total = 0
    envio = 0

    for item in carrito.items:
        producto = item.producto
        if producto.existencia < item.cantidad:
            raise HTTPException(400, f"Stock insuficiente de '{producto.nombre}'")

        producto.existencia -= item.cantidad

        iva = 0.10 if "electrónica" in producto.categoria.lower() else 0.21
        precio_con_iva = producto.precio * (1 + iva)

        total += precio_con_iva * item.cantidad

    envio = 0 if total > 1000 else 50
    total_final = total + envio

    compra = Compra(
        usuario_id=usuario.id,
        fecha=datetime.now(),
        direccion=direccion,
        tarjeta=tarjeta,
        total=round(total_final, 2),
        envio=envio
    )
    db.add(compra)
    db.commit()
    db.refresh(compra)

    for item in carrito.items:
        producto = item.producto
        iva = 0.10 if "electrónica" in producto.categoria.lower() else 0.21
        precio_unitario = producto.precio * (1 + iva)

        item_compra = ItemCompra(
            compra_id=compra.id,
            producto_id=producto.id,
            nombre=producto.nombre,
            cantidad=item.cantidad,
            precio_unitario=round(precio_unitario, 2)
        )
        db.add(item_compra)

    carrito.estado = "finalizado"
    db.commit()

    return {
        "mensaje": "Compra realizada con éxito 🎉",
        "compra_id": compra.id,
        "total": round(total_final, 2),
        "envio": envio
    }
