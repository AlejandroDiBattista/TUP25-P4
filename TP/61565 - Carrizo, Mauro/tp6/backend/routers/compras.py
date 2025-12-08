from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_session
from models import Usuario, Compra, ItemCompra, ItemCarrito, Producto
from schemas import CompraResponse, CompraResumen
from auth import get_current_user
from datetime import datetime

router = APIRouter()

def calcular_iva(items_carrito: list[ItemCarrito], session: Session) -> float:
    """Calcular IVA según las reglas de negocio"""
    iva_total = 0.0
    for item in items_carrito:
        producto = session.get(Producto, item.producto_id)
        if producto:
            subtotal_item = producto.precio * item.cantidad
            # Electrónicos: 10%, otros: 21%
            categoria_lower = producto.categoria.lower().strip()
            if "electrónico" in categoria_lower or "electronico" in categoria_lower:
                iva_total += subtotal_item * 0.10
            else:
                iva_total += subtotal_item * 0.21
    return iva_total

def calcular_envio(subtotal: float) -> float:
    """Calcular costo de envío"""
    if subtotal > 1000:
        return 0.0
    return 50.0

def crear_compra(
    usuario_id: int,
    direccion: str,
    tarjeta: str,
    items_carrito: list[ItemCarrito],
    subtotal: float,
    iva: float,
    envio: float,
    total: float,
    session: Session
) -> Compra:
    """Crear una nueva compra con sus items"""
    compra = Compra(
        usuario_id=usuario_id,
        direccion=direccion,
        tarjeta=tarjeta,
        total=total,
        envio=envio
    )
    session.add(compra)
    session.commit()
    session.refresh(compra)
    
    # Crear items de compra
    for item_carrito in items_carrito:
        producto = session.get(Producto, item_carrito.producto_id)
        item_compra = ItemCompra(
            compra_id=compra.id,
            producto_id=producto.id,
            cantidad=item_carrito.cantidad,
            nombre=producto.nombre,
            precio_unitario=producto.precio
        )
        session.add(item_compra)
    
    session.commit()
    session.refresh(compra)
    return compra

@router.get("/compras", response_model=list[CompraResumen])
async def ver_compras(
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Ver resumen de compras del usuario"""
    statement = select(Compra).where(Compra.usuario_id == current_user.id)
    compras = session.exec(statement).all()
    
    resumenes = []
    for compra in compras:
        cantidad_items = sum(item.cantidad for item in compra.items)
        resumenes.append(CompraResumen(
            id=compra.id,
            fecha=compra.fecha,
            total=compra.total,
            cantidad_items=cantidad_items
        ))
    
    return resumenes

@router.get("/compras/{id}", response_model=CompraResponse)
async def ver_detalle_compra(
    id: int,
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Ver detalle de una compra específica"""
    compra = session.get(Compra, id)
    if not compra:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compra no encontrada"
        )
    
    # Verificar que la compra pertenece al usuario
    if compra.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver esta compra"
        )
    
    return compra

