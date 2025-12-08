from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from backend.database import engine
from backend.models.cart import Cart, CartItem

router = APIRouter(prefix="/carrito")

def get_session():
    with Session(engine) as session:
        yield session

# --------------------------
# Obtener carrito
# --------------------------
@router.get("/{usuario_id}")
def obtener_carrito(usuario_id: int, session: Session = Depends(get_session)):

    carrito = session.exec(
        select(Cart).where(Cart.usuario_id == usuario_id, Cart.estado == "abierto")
    ).first()

    if not carrito:
        carrito = Cart(usuario_id=usuario_id, estado="abierto")
        session.add(carrito)
        session.commit()
        session.refresh(carrito)

    items = session.exec(
        select(CartItem).where(CartItem.carrito_id == carrito.id)
    ).all()

    return {"carrito_id": carrito.id, "items": items}


# --------------------------
# Agregar item
# --------------------------
@router.post("/agregar")
def agregar_producto(data: dict, session: Session = Depends(get_session)):

    usuario_id = data["usuario_id"]
    producto_id = data["producto_id"]
    cantidad = data["cantidad"]

    carrito = session.exec(
        select(Cart).where(Cart.usuario_id == usuario_id, Cart.estado == "abierto")
    ).first()

    if not carrito:
        carrito = Cart(usuario_id=usuario_id, estado="abierto")
        session.add(carrito)
        session.commit()
        session.refresh(carrito)

    existente = session.exec(
        select(CartItem).where(
            CartItem.carrito_id == carrito.id,
            CartItem.producto_id == producto_id
        )
    ).first()

    if existente:
        existente.cantidad += cantidad
    else:
        item = CartItem(
            carrito_id=carrito.id,
            producto_id=producto_id,
            cantidad=cantidad
        )
        session.add(item)

    session.commit()
    return {"mensaje": "Producto agregado"}

# --------------------------
# Actualizar cantidad
# --------------------------
@router.put("/cantidad")
def actualizar_cantidad(item_id: int, cantidad: int, session: Session = Depends(get_session)):

    item = session.get(CartItem, item_id)
    if not item:
        raise HTTPException(404, "Item no encontrado")

    item.cantidad = cantidad
    session.commit()
    return {"mensaje": "Cantidad actualizada"}

# --------------------------
# Eliminar item
# --------------------------
@router.delete("/{item_id}")
def eliminar_item(item_id: int, session: Session = Depends(get_session)):

    item = session.get(CartItem, item_id)
    if not item:
        raise HTTPException(404, "Item no encontrado")

    session.delete(item)
    session.commit()
    return {"mensaje": "Item eliminado"}

# --------------------------
# Vaciar carrito
# --------------------------
@router.delete("/vaciar/{usuario_id}")
def vaciar_carrito(usuario_id: int, session: Session = Depends(get_session)):

    carrito = session.exec(
        select(Cart).where(Cart.usuario_id == usuario_id, Cart.estado == "abierto")
    ).first()

    if not carrito:
        return {"mensaje": "Carrito vacío"}

    items = session.exec(
        select(CartItem).where(CartItem.carrito_id == carrito.id)
    ).all()

    for item in items:
        session.delete(item)

    session.commit()
    return {"mensaje": "Carrito vaciado"}
