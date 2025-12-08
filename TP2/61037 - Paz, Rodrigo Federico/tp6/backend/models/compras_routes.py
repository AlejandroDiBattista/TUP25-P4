from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from models.database import engine
from models.carrito import Carrito, ItemCarrito
from models.productos import Producto
from models.compras import Compra, ItemCompra
from pydantic import BaseModel, validator

router = APIRouter()

class FinalizarCompraRequest(BaseModel):
    usuario_id: int
    direccion: str
    tarjeta: str
    
    @validator('direccion')
    def validar_direccion(cls, v):
        v = v.strip()
        if len(v) < 10:
            raise ValueError('La dirección debe tener al menos 10 caracteres')
        if len(v) > 200:
            raise ValueError('La dirección no puede exceder 200 caracteres')
        return v
    
    @validator('tarjeta')
    def validar_tarjeta(cls, v):
        # Remover espacios y guiones
        tarjeta_limpia = v.replace(' ', '').replace('-', '')
        
        # Verificar que solo contenga dígitos
        if not tarjeta_limpia.isdigit():
            raise ValueError('La tarjeta debe contener solo números')
        
        # Verificar longitud (16 dígitos)
        if len(tarjeta_limpia) != 16:
            raise ValueError('La tarjeta debe tener 16 dígitos')
        
        return tarjeta_limpia

@router.post("/carrito/finalizar")
def finalizar_compra(datos: FinalizarCompraRequest):
    with Session(engine) as session:
        carrito = session.exec(
            select(Carrito).where(Carrito.usuario_id == datos.usuario_id, Carrito.estado == "activo")
        ).first()
        if not carrito:
            raise HTTPException(status_code=400, detail="No hay carrito activo para finalizar")

        items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all()
        if not items:
            raise HTTPException(status_code=400, detail="El carrito está vacío")

        subtotal = 0.0
        iva_total = 0.0

        for item in items:
            producto = session.get(Producto, item.producto_id)
            if producto.existencia < item.cantidad:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Stock insuficiente de '{producto.nombre}'. Disponible: {producto.existencia}, solicitado: {item.cantidad}"
                )

            line_subtotal = producto.precio * item.cantidad
            subtotal += line_subtotal

            # Calcular IVA según categoría
            iva_rate = 0.10 if producto.categoria.lower() == "electrónica" else 0.21
            iva_total += round(line_subtotal * iva_rate, 2)

        # Calcular envío
        envio = 0 if subtotal > 1000 else 50
        total = round(subtotal + iva_total + envio, 2)

        # Reducir stock
        for item in items:
            producto = session.get(Producto, item.producto_id)
            producto.existencia -= item.cantidad

        compra = Compra(
            usuario_id=datos.usuario_id,
            fecha=datetime.now().strftime("%d/%m/%Y %H:%M"),
            direccion=datos.direccion,
            tarjeta="****-****-****-" + datos.tarjeta[-4:],
            subtotal=round(subtotal, 2),
            iva=round(iva_total, 2),
            envio=float(envio),
            total=total,
        )
        session.add(compra)
        session.commit()
        session.refresh(compra)

        for item in items:
            producto = session.get(Producto, item.producto_id)
            session.add(ItemCompra(
                compra_id=compra.id,
                nombre=producto.nombre,
                cantidad=item.cantidad,
                precio_unitario=producto.precio
            ))

        carrito.estado = "finalizado"
        session.commit()

        return {"mensaje": "Compra realizada con éxito", "compra_id": compra.id, "total_pagado": total}

@router.get("/compras")
def ver_compras(usuario_id: int):
    with Session(engine) as session:
        return session.exec(select(Compra).where(Compra.usuario_id == usuario_id)).all()

@router.get("/compras/{compra_id}")
def detalle_compra(compra_id: int):
    with Session(engine) as session:
        compra = session.get(Compra, compra_id)
        if not compra:
            raise HTTPException(status_code=404, detail="Compra no encontrada")
        items = session.exec(select(ItemCompra).where(ItemCompra.compra_id == compra_id)).all()
        return {"compra": compra, "items": items}
