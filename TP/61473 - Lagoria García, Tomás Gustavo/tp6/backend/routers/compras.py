"""
Router de historial de compras
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Annotated

from database import get_session
from models import Usuario, Compra, CompraResponse, CompraResumen, ItemCompraResponse
from dependencies.auth import get_usuario_actual

router = APIRouter(prefix="/compras", tags=["Compras"])


@router.get("", response_model=list[CompraResumen])
def listar_compras(
    usuario: Annotated[Usuario, Depends(get_usuario_actual)],
    session: Annotated[Session, Depends(get_session)]
):
    """
    Obtiene el resumen de todas las compras del usuario autenticado.
    
    Requiere autenticación.
    
    Retorna una lista de compras ordenadas por fecha (más reciente primero).
    Cada compra incluye: id, fecha, total, cantidad de items.
    """
    statement = (
        select(Compra)
        .where(Compra.usuario_id == usuario.id)
        .order_by(Compra.fecha.desc())
    )
    compras = session.exec(statement).all()
    
    return [
        CompraResumen(
            id=compra.id,
            fecha=compra.fecha,
            total=compra.total,
            cantidad_items=len(compra.items)
        )
        for compra in compras
    ]


@router.get("/{compra_id}", response_model=CompraResponse)
def obtener_detalle_compra(
    compra_id: int,
    usuario: Annotated[Usuario, Depends(get_usuario_actual)],
    session: Annotated[Session, Depends(get_session)]
):
    """
    Obtiene el detalle completo de una compra específica.
    
    Requiere autenticación.
    Solo se pueden ver compras propias.
    
    Incluye:
    - Información de la compra (fecha, dirección, tarjeta enmascarada)
    - Detalle de cada producto (nombre, precio al momento de compra, cantidad)
    - Totales (subtotal, IVA, envío, total)
    """
    # Buscar la compra
    compra = session.get(Compra, compra_id)
    
    if not compra:
        raise HTTPException(
            status_code=404,
            detail="Compra no encontrada"
        )
    
    # Verificar que la compra pertenezca al usuario
    if compra.usuario_id != usuario.id:
        raise HTTPException(
            status_code=403,
            detail="No tienes permiso para ver esta compra"
        )
    
    return CompraResponse(
        id=compra.id,
        fecha=compra.fecha,
        direccion=compra.direccion,
        tarjeta=compra.tarjeta,
        items=[
            ItemCompraResponse(
                id=item.id,
                producto_id=item.producto_id,
                nombre=item.nombre,
                precio_unitario=item.precio_unitario,
                cantidad=item.cantidad,
                subtotal=item.precio_unitario * item.cantidad,
                categoria=item.categoria,
                imagen=item.imagen
            )
            for item in compra.items
        ],
        cantidad_items=len(compra.items),
        subtotal=compra.subtotal,
        iva=compra.iva,
        envio=compra.envio,
        total=compra.total
    )
