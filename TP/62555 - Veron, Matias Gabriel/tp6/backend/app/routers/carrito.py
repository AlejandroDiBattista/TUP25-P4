from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from app.database import get_session
from app.deps import get_current_user
from app.models.productos import Producto
from app.models.carritos import Carrito, CarritoItem
from app.models.compras import Compra, CompraItem
from app.models.usuarios import Usuario

router = APIRouter()

# Modelos de request
class AgregarCarritoRequest(BaseModel):
    producto_id: int
    cantidad: int = 1

class FinalizarCompraRequest(BaseModel):
    direccion: str
    tarjeta: str

def _get_or_create_cart(db: Session, user: Usuario):
    # Buscar carrito existente del usuario
    cart = db.exec(select(Carrito).where(Carrito.usuario_id == user.id)).first()
    if not cart:
        cart = Carrito(usuario_id=user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

def _calc_iva(cat: str, subtotal: float) -> float:
    return subtotal * (0.10 if cat.lower() in ["electronicos", "electrónica", "electronica"] else 0.21)

@router.get("/")
def ver_carrito(db: Session = Depends(get_session), user: Usuario = Depends(get_current_user)):
    cart = _get_or_create_cart(db, user)
    subtotal = iva = 0.0
    items = []
    
    for it in cart.items:
        prod = db.get(Producto, it.producto_id)
        if prod:
            item_subtotal = prod.precio * it.cantidad
            item_iva = _calc_iva(prod.categoria, item_subtotal)
            subtotal += item_subtotal
            iva += item_iva
            items.append({
                "id": it.id,
                "producto": {
                    "id": prod.id,
                    "nombre": prod.nombre,
                    "precio": prod.precio,
                    "imagen": prod.imagen,
                    "categoria": prod.categoria,
                    "stock": prod.existencia,
                },
                "cantidad": it.cantidad,
                "subtotal": item_subtotal
            })
    
    envio = 0 if subtotal > 100000 else 5000
    total = subtotal + iva + envio
    
    return {
        "items": items, 
        "subtotal": subtotal, 
        "iva": iva, 
        "envio": envio, 
        "total": total
    }

@router.post("/")
def agregar_carrito(
    data: AgregarCarritoRequest,
    db: Session = Depends(get_session), 
    user: Usuario = Depends(get_current_user)
):
    prod = db.get(Producto, data.producto_id)
    if not prod:
        raise HTTPException(404, "Producto no encontrado")
    if prod.existencia < data.cantidad:
        raise HTTPException(400, "Sin stock suficiente")
    
    cart = _get_or_create_cart(db, user)
    
    # Buscar si ya existe el producto en el carrito
    item = db.exec(
        select(CarritoItem).where(
            CarritoItem.carrito_id == cart.id,
            CarritoItem.producto_id == data.producto_id
        )
    ).first()
    
    if item:
        nueva_cantidad = item.cantidad + data.cantidad
        if prod.existencia < data.cantidad:  # Solo verificar la cantidad que se está agregando
            raise HTTPException(400, "Stock insuficiente")
        item.cantidad = nueva_cantidad
        prod.existencia -= data.cantidad  # Reducir stock por la cantidad agregada
    else:
        new_item = CarritoItem(
            carrito_id=cart.id, 
            producto_id=data.producto_id, 
            cantidad=data.cantidad
        )
        db.add(new_item)
        prod.existencia -= data.cantidad  # Reducir stock
    
    db.commit()
    return {"ok": True, "mensaje": "Producto agregado al carrito"}

@router.delete("/{producto_id}")
def eliminar_item(
    producto_id: int, 
    db: Session = Depends(get_session), 
    user: Usuario = Depends(get_current_user)
):
    cart = _get_or_create_cart(db, user)
    
    item = db.exec(
        select(CarritoItem).where(
            CarritoItem.carrito_id == cart.id,
            CarritoItem.producto_id == producto_id
        )
    ).first()
    
    if not item:
        raise HTTPException(404, "Producto no encontrado en el carrito")
    
    # Restaurar stock
    prod = db.get(Producto, producto_id)
    if prod:
        prod.existencia += item.cantidad
    
    db.delete(item)
    db.commit()
    return {"ok": True, "mensaje": "Producto eliminado del carrito"}

@router.post("/finalizar")
def finalizar_compra(
    data: FinalizarCompraRequest,
    db: Session = Depends(get_session), 
    user: Usuario = Depends(get_current_user)
):
    cart = _get_or_create_cart(db, user)
    
    if not cart.items:
        raise HTTPException(400, "El carrito está vacío")
    
    subtotal = iva = 0.0
    
    # Calcular totales y verificar stock
    for it in cart.items:
        prod = db.get(Producto, it.producto_id)
        if not prod:
            raise HTTPException(400, f"Producto {it.producto_id} no encontrado")
        if prod.existencia < it.cantidad:
            raise HTTPException(400, f"Stock insuficiente para {prod.nombre}")
        
        item_subtotal = prod.precio * it.cantidad
        subtotal += item_subtotal
        iva += _calc_iva(prod.categoria, item_subtotal)
    
    envio = 0 if subtotal > 100000 else 5000
    total = subtotal + iva + envio
    
    # Crear la compra
    compra = Compra(
        usuario_id=user.id, 
        direccion_envio=data.direccion, 
        tarjeta=data.tarjeta, 
        total=total
    )
    db.add(compra)
    db.commit()
    db.refresh(compra)
    
    # Crear items de la compra y actualizar stock
    # Crear los items de compra
    for it in cart.items:
        prod = db.get(Producto, it.producto_id)
        item_subtotal = prod.precio * it.cantidad
        db.add(CompraItem(
            compra_id=compra.id, 
            producto_id=prod.id, 
            cantidad=it.cantidad,
            subtotal=item_subtotal
        ))
        # NO reducir stock aquí, ya se redujo al agregar al carrito
    
    # Vaciar el carrito
    for item in cart.items:
        db.delete(item)
    
    db.commit()
    
    return {
        "ok": True, 
        "compra_id": compra.id, 
        "total": total,
        "mensaje": "Compra realizada exitosamente"
    }

@router.post("/vaciar")
def vaciar_carrito(
    db: Session = Depends(get_session), 
    user: Usuario = Depends(get_current_user)
):
    cart = _get_or_create_cart(db, user)
    
    # Restaurar stock de todos los items antes de eliminarlos
    for item in cart.items:
        prod = db.get(Producto, item.producto_id)
        if prod:
            prod.existencia += item.cantidad
        db.delete(item)
    
    db.commit()
    return {"ok": True, "mensaje": "Carrito vaciado"}

@router.patch("/{producto_id}")
def actualizar_cantidad(
    producto_id: int,
    cantidad: int,
    db: Session = Depends(get_session), 
    user: Usuario = Depends(get_current_user)
):
    if cantidad <= 0:
        raise HTTPException(400, "La cantidad debe ser mayor a 0")
    
    prod = db.get(Producto, producto_id)
    if not prod:
        raise HTTPException(404, "Producto no encontrado")
    
    cart = _get_or_create_cart(db, user)
    
    item = db.exec(
        select(CarritoItem).where(
            CarritoItem.carrito_id == cart.id,
            CarritoItem.producto_id == producto_id
        )
    ).first()
    
    if not item:
        raise HTTPException(404, "Producto no encontrado en el carrito")
    
    # Calcular diferencia de stock
    diferencia = cantidad - item.cantidad
    
    # Verificar si hay suficiente stock
    if diferencia > 0 and prod.existencia < diferencia:
        raise HTTPException(400, "Stock insuficiente")
    
    # Actualizar stock y cantidad
    prod.existencia -= diferencia  # Si diferencia es negativa, suma stock
    item.cantidad = cantidad
    db.commit()
    
    return {"ok": True, "mensaje": "Cantidad actualizada"}

