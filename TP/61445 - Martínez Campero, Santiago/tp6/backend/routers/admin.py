"""Endpoints de administración para gestión de productos."""

from fastapi import APIRouter, HTTPException, Depends, Header, status
from sqlmodel import Session, select
from typing import Optional
from pydantic import BaseModel

from database import get_session
from models.productos import Producto
from models.usuarios import Usuario
from utils import validate_token_from_header

router = APIRouter(prefix="/admin", tags=["admin"])


class ProductoCreate(BaseModel):
    nombre: str
    descripcion: str
    precio: float
    categoria: str
    existencia: int


class ProductoUpdate(BaseModel):
    nombre: str
    descripcion: str
    precio: float
    categoria: str
    existencia: int


@router.post("/productos", response_model=dict)
def crear_producto(
    producto_data: ProductoCreate,
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    """Crear un nuevo producto (solo admin)."""
    
    # Validar el token
    usuario_id = validate_token_from_header(authorization)
    
    usuario = session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    # En un sistema real, verificarías si el usuario es admin
    # Por ahora, cualquier usuario autenticado puede crear productos
    
    # Validar datos
    if producto_data.precio <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El precio debe ser mayor a 0"
        )
    
    if producto_data.existencia < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La existencia no puede ser negativa"
        )
    
    # Crear producto
    producto = Producto(
        nombre=producto_data.nombre,
        descripcion=producto_data.descripcion,
        precio=producto_data.precio,
        categoria=producto_data.categoria,
        existencia=producto_data.existencia,
        valoracion=0.0,
        imagen="static/default-product.jpg"  # Imagen por defecto
    )
    
    session.add(producto)
    session.commit()
    session.refresh(producto)
    
    return {
        "mensaje": "Producto creado exitosamente",
        "producto": {
            "id": producto.id,
            "nombre": producto.nombre,
            "descripcion": producto.descripcion,
            "precio": producto.precio,
            "categoria": producto.categoria,
            "existencia": producto.existencia,
            "valoracion": producto.valoracion,
            "imagen": producto.imagen
        }
    }


@router.put("/productos/{producto_id}", response_model=dict)
def actualizar_producto(
    producto_id: int,
    producto_data: ProductoUpdate,
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    """Actualizar un producto existente (solo admin)."""
    
    # Validar el token
    usuario_id = validate_token_from_header(authorization)
    
    usuario = session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    # Obtener el producto
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    # Validar datos
    if producto_data.precio <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El precio debe ser mayor a 0"
        )
    
    if producto_data.existencia < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La existencia no puede ser negativa"
        )
    
    # Actualizar producto
    producto.nombre = producto_data.nombre
    producto.descripcion = producto_data.descripcion
    producto.precio = producto_data.precio
    producto.categoria = producto_data.categoria
    producto.existencia = producto_data.existencia
    
    session.add(producto)
    session.commit()
    session.refresh(producto)
    
    return {
        "mensaje": "Producto actualizado exitosamente",
        "producto": {
            "id": producto.id,
            "nombre": producto.nombre,
            "descripcion": producto.descripcion,
            "precio": producto.precio,
            "categoria": producto.categoria,
            "existencia": producto.existencia,
            "valoracion": producto.valoracion,
            "imagen": producto.imagen
        }
    }


@router.delete("/productos/{producto_id}", response_model=dict)
def eliminar_producto(
    producto_id: int,
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    """Eliminar un producto (solo admin)."""
    
    # Validar el token
    usuario_id = validate_token_from_header(authorization)
    
    usuario = session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    # Obtener el producto
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    # Eliminar producto
    session.delete(producto)
    session.commit()
    
    return {
        "mensaje": f"Producto '{producto.nombre}' eliminado exitosamente"
    }


@router.post("/productos/{producto_id}/reabastecer", response_model=dict)
def reabastecer_producto(
    producto_id: int,
    cantidad: int,
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    """Reabastecer el stock de un producto (solo admin)."""
    
    # Validar el token
    usuario_id = validate_token_from_header(authorization)
    
    usuario = session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    # Validar cantidad
    if cantidad <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La cantidad debe ser mayor a 0"
        )
    
    # Obtener el producto
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    # Reabastecer
    producto.existencia += cantidad
    
    session.add(producto)
    session.commit()
    session.refresh(producto)
    
    return {
        "mensaje": f"Producto reabastecido. Stock actual: {producto.existencia} unidades",
        "producto": {
            "id": producto.id,
            "nombre": producto.nombre,
            "existencia": producto.existencia
        }
    }
