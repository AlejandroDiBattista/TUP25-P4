from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from models.database import engine
from models.carrito import Carrito, ItemCarrito
from models.productos import Producto

router = APIRouter()

def _armar_carrito(session: Session, carrito_id: int):
    items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito_id)).all()
    resultado = []
    for it in items:
        prod = session.get(Producto, it.producto_id)
        if not prod: 
            
            continue
        resultado.append({
            "producto_id": prod.id,
            "nombre": prod.nombre,
            "precio": prod.precio,
            "categoria": prod.categoria,
            "existencia": prod.existencia,
            "cantidad": it.cantidad,
            "subtotal": round(prod.precio * it.cantidad, 2)
        })
    return resultado

@router.post("/carrito")
def agregar_al_carrito(usuario_id: int, producto_id: int):
    with Session(engine) as session:
        carrito = session.exec(
            select(Carrito).where(Carrito.usuario_id == usuario_id, Carrito.estado == "activo")
        ).first()

        if not carrito:
            carrito = Carrito(usuario_id=usuario_id)
            session.add(carrito)
            session.commit()
            session.refresh(carrito)

        producto = session.get(Producto, producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        # Verificar stock disponible
        if producto.existencia <= 0:
            raise HTTPException(status_code=400, detail=f"El producto '{producto.nombre}' está agotado")

        item = session.exec(
            select(ItemCarrito).where(
                ItemCarrito.carrito_id == carrito.id,
                ItemCarrito.producto_id == producto_id
            )
        ).first()

        if item:
            # Verificar que no exceda el stock disponible
            if item.cantidad + 1 > producto.existencia:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Stock insuficiente. Solo quedan {producto.existencia} unidades de '{producto.nombre}'"
                )
            item.cantidad += 1
        else:
            # Producto nuevo en el carrito (ya verificamos que hay stock)
            session.add(ItemCarrito(carrito_id=carrito.id, producto_id=producto_id, cantidad=1))

        session.commit()
        return {"mensaje": "Producto agregado", "items": _armar_carrito(session, carrito.id)}

@router.get("/carrito")
def ver_carrito(usuario_id: int):
    with Session(engine) as session:
        carrito = session.exec(
            select(Carrito).where(Carrito.usuario_id == usuario_id, Carrito.estado == "activo")
        ).first()
        if not carrito:
            return {"items": []}
        return {"items": _armar_carrito(session, carrito.id)}

@router.delete("/carrito/{producto_id}")
def quitar_producto(usuario_id: int, producto_id: int):
    with Session(engine) as session:
        carrito = session.exec(
            select(Carrito).where(Carrito.usuario_id == usuario_id, Carrito.estado == "activo")
        ).first()
        if not carrito:
            raise HTTPException(status_code=400, detail="No hay carrito activo")

        item = session.exec(
            select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == producto_id)
        ).first()
        if not item:
            raise HTTPException(status_code=404, detail="Producto no está en el carrito")

        session.delete(item)
        session.commit()
        return {"mensaje": "Producto eliminado", "items": _armar_carrito(session, carrito.id)}

@router.post("/carrito/cancelar")
def cancelar_compra(usuario_id: int):
    with Session(engine) as session:
        carrito = session.exec(
            select(Carrito).where(Carrito.usuario_id == usuario_id, Carrito.estado == "activo")
        ).first()
        if not carrito:
            return {"mensaje": "No hay carrito activo", "items": []}
       
        items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all()
        for it in items:
            session.delete(it)
        carrito.estado = "cancelado"
        session.commit()
        return {"mensaje": "Carrito cancelado", "items": []}
