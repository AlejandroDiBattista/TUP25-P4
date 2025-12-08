from fastapi import APIRouter, HTTPException, Depends, Header
from sqlmodel import Session, select
from typing import Optional
from pydantic import BaseModel

from models import Carrito, ItemCarrito, Usuario, Producto
from database import engine
from utils import validate_token_from_header
from config import IVA_STANDARD, IVA_ELECTRONICA, ELECTRONICS_CATEGORIES, SHIPPING_FREE_THRESHOLD, SHIPPING_COST

router = APIRouter(prefix="/carrito", tags=["carrito"])


class ActualizarCantidadRequest(BaseModel):
    cantidad: int


def get_session():
    with Session(engine) as session:
        yield session


def get_or_create_carrito(usuario_id: int, session: Session) -> Carrito:
    statement = select(Carrito).where(
        (Carrito.usuario_id == usuario_id) & 
        (Carrito.estado == "activo")
    )
    carrito = session.exec(statement).first()
    
    if not carrito:
        carrito = Carrito(usuario_id=usuario_id, estado="activo")
        session.add(carrito)
        session.commit()
        session.refresh(carrito)
    
    return carrito


@router.post("")
def agregar_al_carrito(
    producto_id: int,
    cantidad: int = 1,
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    # Validar el token
    usuario_id = validate_token_from_header(authorization)
    
    # Obtener el usuario
    usuario = session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    # Validar que el producto existe
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    if producto.existencia < cantidad:
        raise HTTPException(status_code=400, detail="Existencia insuficiente")
    
    carrito = get_or_create_carrito(usuario.id, session)
    
    statement = select(ItemCarrito).where(
        (ItemCarrito.carrito_id == carrito.id) &
        (ItemCarrito.producto_id == producto_id)
    )
    item_existente = session.exec(statement).first()
    
    if item_existente:
        nueva_cantidad = item_existente.cantidad + cantidad
        # Validar que la nueva cantidad total no exceda el stock
        if producto.existencia < nueva_cantidad:
            raise HTTPException(
                status_code=400, 
                detail=f"Stock insuficiente. Disponible: {producto.existencia}, en carrito: {item_existente.cantidad}"
            )
        item_existente.cantidad = nueva_cantidad
    else:
        nuevo_item = ItemCarrito(
            carrito_id=carrito.id,
            producto_id=producto_id,
            cantidad=cantidad
        )
        session.add(nuevo_item)
    
    session.commit()
    
    return {"mensaje": "Producto agregado al carrito", "cantidad": cantidad}


@router.get("")
def obtener_carrito(
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    # Validar el token
    usuario_id = validate_token_from_header(authorization)
    
    usuario = session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    carrito = get_or_create_carrito(usuario.id, session)
    
    statement = select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)
    items = session.exec(statement).all()
    
    items_detalle = []
    subtotal = 0.0
    
    for item in items:
        producto = session.get(Producto, item.producto_id)
        precio_total = producto.precio * item.cantidad
        subtotal += precio_total
        
        items_detalle.append({
            "id": item.id,
            "producto_id": producto.id,
            "nombre": producto.nombre,
            "precio_unitario": producto.precio,
            "cantidad": item.cantidad,
            "precio_total": precio_total,
            "imagen": producto.imagen
        })
    
    iva = subtotal * (IVA_STANDARD)
    envio = SHIPPING_COST if subtotal <= SHIPPING_FREE_THRESHOLD else 0.0
    total = subtotal + iva + envio
    
    return {
        "id": carrito.id,
        "estado": carrito.estado,
        "items": items_detalle,
        "subtotal": round(subtotal, 2),
        "iva": round(iva, 2),
        "envio": round(envio, 2),
        "total": round(total, 2)
    }


@router.post("/cancelar")
def cancelar_carrito(
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    # Validar el token
    usuario_id = validate_token_from_header(authorization)
    
    usuario = session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    carrito = get_or_create_carrito(usuario.id, session)
    
    statement = select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)
    items = session.exec(statement).all()
    
    for item in items:
        session.delete(item)
    
    carrito.estado = "cancelado"
    session.commit()
    
    return {"mensaje": "Carrito cancelado"}


@router.delete("/{item_id}")
def quitar_del_carrito(
    item_id: int,
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    # Validar el token
    usuario_id = validate_token_from_header(authorization)
    
    usuario = session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    item = session.get(ItemCarrito, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    carrito = session.get(Carrito, item.carrito_id)
    if carrito.usuario_id != usuario.id:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    session.delete(item)
    session.commit()
    
    return {"mensaje": "Producto removido del carrito"}


@router.put("/{item_id}")
def actualizar_cantidad_carrito(
    item_id: int,
    request: ActualizarCantidadRequest,
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    """Actualizar la cantidad de un item en el carrito."""
    # Validar el token
    usuario_id = validate_token_from_header(authorization)
    
    usuario = session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    cantidad = request.cantidad
    
    item = session.get(ItemCarrito, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    carrito = session.get(Carrito, item.carrito_id)
    if carrito.usuario_id != usuario.id:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    # Validar cantidad
    if cantidad < 1:
        raise HTTPException(status_code=400, detail="La cantidad debe ser mayor a 0")
    
    # Obtener el producto para validar existencia
    producto = session.get(Producto, item.producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    if producto.existencia < cantidad:
        raise HTTPException(status_code=400, detail="Existencia insuficiente")
    
    # Actualizar cantidad
    item.cantidad = cantidad
    session.add(item)
    session.commit()
    
    # Retornar el carrito actualizado
    statement = select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)
    items = session.exec(statement).all()
    
    items_detalle = []
    subtotal = 0.0
    
    for it in items:
        prod = session.get(Producto, it.producto_id)
        precio_total = prod.precio * it.cantidad
        subtotal += precio_total
        
        items_detalle.append({
            "id": it.id,
            "producto_id": prod.id,
            "nombre": prod.nombre,
            "precio_unitario": prod.precio,
            "cantidad": it.cantidad,
            "precio_total": precio_total,
            "imagen": prod.imagen
        })
    
    iva = subtotal * (IVA_STANDARD)
    envio = SHIPPING_COST if subtotal <= SHIPPING_FREE_THRESHOLD else 0.0
    total = subtotal + iva + envio
    
    return {
        "id": carrito.id,
        "estado": carrito.estado,
        "items": items_detalle,
        "subtotal": round(subtotal, 2),
        "iva": round(iva, 2),
        "envio": round(envio, 2),
        "total": round(total, 2)
    }
