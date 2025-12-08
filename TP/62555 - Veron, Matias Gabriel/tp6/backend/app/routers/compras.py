from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.deps import get_current_user
from app.models.compras import Compra, CompraItem
from app.models.usuarios import Usuario

router = APIRouter()

@router.get("/")
def listar_compras(db: Session = Depends(get_session), user: Usuario = Depends(get_current_user)):
    compras = db.exec(select(Compra).where(Compra.usuario_id == user.id).order_by(Compra.fecha.desc())).all()
    return [{"id": c.id, "fecha": c.fecha.isoformat(), "total": c.total, "direccion": c.direccion_envio} for c in compras]

@router.get("/{id}")
def detalle_compra(id: int, db: Session = Depends(get_session), user: Usuario = Depends(get_current_user)):
    from app.models.productos import Producto
    
    c = db.get(Compra, id)
    if not c or c.usuario_id != user.id:
        raise HTTPException(404, "Compra no encontrada")
    
    items = db.exec(select(CompraItem).where(CompraItem.compra_id == id)).all()
    
    # Construir items con información del producto
    items_detalle = []
    subtotal = iva = 0.0
    
    for item in items:
        prod = db.get(Producto, item.producto_id)
        if prod:
            precio_unitario = item.subtotal / item.cantidad
            item_iva = item.subtotal * (0.10 if prod.categoria.lower() in ["electronicos", "electrónica", "electronica"] else 0.21)
            
            items_detalle.append({
                "nombre": prod.nombre,
                "cantidad": item.cantidad,
                "precio_unitario": precio_unitario,
                "subtotal": item.subtotal
            })
            
            subtotal += item.subtotal
            iva += item_iva
    
    envio = 0 if subtotal > 100000 else 5000
    
    return {
        "id": c.id,
        "fecha": c.fecha.isoformat(),
        "direccion": c.direccion_envio,
        "tarjeta": c.tarjeta[-4:] if len(c.tarjeta) >= 4 else c.tarjeta,
        "subtotal": subtotal,
        "iva": iva,
        "envio": envio,
        "total": c.total,
        "items": items_detalle
    }
