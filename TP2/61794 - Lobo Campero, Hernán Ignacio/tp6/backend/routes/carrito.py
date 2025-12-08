from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime
from typing import Optional

from database.connection import get_session
from models.carrito import Carrito, ItemCarrito
from models.productos import Producto
from models.compra import Compra, ItemCompra
from schemas.carrito import (
    AgregarAlCarritoRequest,
    FinalizarCompraRequest,
)
from utils.auth import decode_token, obtener_usuario_id

router = APIRouter(prefix="/api", tags=["carrito"])


@router.get("/carrito", response_model=dict)
def obtener_carrito(
    token: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """Obtener el carrito activo del usuario"""
    usuario_id = obtener_usuario_id(token)
    
    carrito = session.query(Carrito).filter(
        and_(Carrito.usuario_id == usuario_id, Carrito.estado == "activo")
    ).first()
    
    if not carrito:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hay carrito activo"
        )
    
    # Obtener items del carrito
    items = session.query(ItemCarrito).filter(ItemCarrito.carrito_id == carrito.id).all()
    
    return {
        "id": carrito.id,
        "usuario_id": carrito.usuario_id,
        "estado": carrito.estado,
        "items": [{"id": item.id, "carrito_id": item.carrito_id, "producto_id": item.producto_id, "cantidad": item.cantidad, "precio_unitario": item.precio_unitario} for item in items]
    }


@router.post("/carrito", response_model=dict)
def agregar_al_carrito(
    request: AgregarAlCarritoRequest,
    token: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """Agregar un producto al carrito con validaciones completas"""
    try:
        usuario_id = obtener_usuario_id(token)
        
        # Validar cantidad
        if request.cantidad <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="La cantidad debe ser mayor a 0"
            )
        
        # Verificar que el producto existe
        producto = session.query(Producto).filter(Producto.id == request.producto_id).first()
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        
        # Verificar que hay existencia
        if producto.existencia < request.cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No hay suficiente existencia. Disponibles: {producto.existencia}"
            )
        
        # Obtener o crear carrito activo
        carrito = session.query(Carrito).filter(
            and_(Carrito.usuario_id == usuario_id, Carrito.estado == "activo")
        ).first()
        
        if not carrito:
            carrito = Carrito(usuario_id=usuario_id, estado="activo")
            session.add(carrito)
            session.flush()
        
        # Verificar si el producto ya está en el carrito
        item_existente = session.query(ItemCarrito).filter(
            and_(ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == request.producto_id)
        ).first()
        
        if item_existente:
            # Actualizar cantidad
            nueva_cantidad = item_existente.cantidad + request.cantidad
            if producto.existencia < nueva_cantidad:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"No hay suficiente existencia. Disponibles: {producto.existencia}"
                )
            item_existente.cantidad = nueva_cantidad
        else:
            # Crear nuevo item
            item = ItemCarrito(
                carrito_id=carrito.id,
                producto_id=request.producto_id,
                cantidad=request.cantidad,
                precio_unitario=producto.precio
            )
            session.add(item)
        
        session.commit()
        
        # Obtener items del carrito actualizado
        items = session.query(ItemCarrito).filter(ItemCarrito.carrito_id == carrito.id).all()
        
        return {
            "id": carrito.id,
            "usuario_id": carrito.usuario_id,
            "estado": carrito.estado,
            "items": [{"id": item.id, "carrito_id": item.carrito_id, "producto_id": item.producto_id, "cantidad": item.cantidad, "precio_unitario": item.precio_unitario} for item in items]
        }
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al agregar producto al carrito"
        )


@router.delete("/carrito/{product_id}", response_model=dict)
def eliminar_del_carrito(
    product_id: int,
    token: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """Eliminar un producto del carrito"""
    usuario_id = obtener_usuario_id(token)
    
    # Buscar por producto_id en lugar de item_id
    item = session.query(ItemCarrito).filter(
        and_(
            ItemCarrito.producto_id == product_id,
            ItemCarrito.carrito_id == session.query(Carrito).filter(Carrito.usuario_id == usuario_id).with_entities(Carrito.id).scalar()
        )
    ).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item no encontrado"
        )
    
    carrito = session.query(Carrito).filter(Carrito.id == item.carrito_id).first()
    if carrito.usuario_id != usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado"
        )
    
    session.delete(item)
    session.commit()
    
    # Obtener items del carrito actualizado
    items = session.query(ItemCarrito).filter(ItemCarrito.carrito_id == carrito.id).all()
    
    return {
        "id": carrito.id,
        "usuario_id": carrito.usuario_id,
        "estado": carrito.estado,
        "items": [{"id": item.id, "carrito_id": item.carrito_id, "producto_id": item.producto_id, "cantidad": item.cantidad, "precio_unitario": item.precio_unitario} for item in items]
    }


@router.post("/carrito/cancelar", response_model=dict)
def cancelar_carrito(
    token: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """Cancelar el carrito activo"""
    usuario_id = obtener_usuario_id(token)
    
    carrito = session.query(Carrito).filter(
        and_(Carrito.usuario_id == usuario_id, Carrito.estado == "activo")
    ).first()
    
    if not carrito:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hay carrito activo para cancelar"
        )
    
    carrito.estado = "cancelado"
    session.commit()
    
    return {"mensaje": "Carrito cancelado exitosamente"}


@router.post("/carrito/finalizar", response_model=dict)
def finalizar_compra(
    request: FinalizarCompraRequest,
    token: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """Finalizar la compra (crear orden)"""
    usuario_id = obtener_usuario_id(token)
    
    carrito = session.query(Carrito).filter(
        and_(Carrito.usuario_id == usuario_id, Carrito.estado == "activo")
    ).first()
    
    if not carrito:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hay carrito activo"
        )
    
    items = session.query(ItemCarrito).filter(ItemCarrito.carrito_id == carrito.id).all()
    
    if not items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El carrito está vacío"
        )
    
    # Calcular subtotal
    subtotal = sum(item.cantidad * item.precio_unitario for item in items)
    
    # Calcular IVA (21% para todos los productos)
    iva_total = subtotal * 0.21
    
    # Calcular envío (free >$1000, else $50)
    envio = 0 if subtotal > 1000 else 50
    
    # Total
    total = subtotal + iva_total + envio
    
    # Crear compra
    compra = Compra(
        usuario_id=usuario_id,
        fecha=datetime.now(),
        direccion=request.direccion,
        total=total,
        iva=iva_total,
        envio=envio,
        tarjeta_ultimos_digitos=request.tarjeta_numero[-4:]
    )
    session.add(compra)
    session.flush()
    
    # Crear items de compra
    for item in items:
        producto = session.query(Producto).filter(Producto.id == item.producto_id).first()
        item_compra = ItemCompra(
            compra_id=compra.id,
            producto_id=item.producto_id,
            cantidad=item.cantidad,
            nombre=producto.titulo,
            precio_unitario=item.precio_unitario
        )
        session.add(item_compra)
        
        # Descontar del inventario
        producto.existencia -= item.cantidad
    
    # Marcar carrito como finalizado
    carrito.estado = "finalizado"
    
    session.commit()
    
    # Obtener items de compra
    items_compra = session.query(ItemCompra).filter(ItemCompra.compra_id == compra.id).all()
    
    return {
        "id": compra.id,
        "usuario_id": compra.usuario_id,
        "fecha": compra.fecha.isoformat(),
        "direccion": compra.direccion,
        "total": compra.total,
        "iva": compra.iva,
        "envio": compra.envio,
        "tarjeta_ultimos_digitos": compra.tarjeta_ultimos_digitos,
        "items": [{"id": ic.id, "compra_id": ic.compra_id, "producto_id": ic.producto_id, "cantidad": ic.cantidad, "nombre": ic.nombre, "precio_unitario": ic.precio_unitario} for ic in items_compra]
    }

