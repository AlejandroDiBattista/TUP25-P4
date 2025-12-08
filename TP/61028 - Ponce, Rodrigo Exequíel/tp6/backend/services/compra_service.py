from fastapi import HTTPException, status
from sqlmodel import Session, select
from models.models import Carrito, ItemCarrito, Producto, Usuario, Compra, ItemCompra
from services.carrito_service import CarritoService
from schemas.compra_schema import CompraCreate, CompraResumenResponse, CompraResponse
from datetime import datetime
from typing import List

# Importamos el schema para poder construir la respuesta manualmente
from schemas.carrito_schema import ItemCarritoResponse 

class CompraService:
    @staticmethod
    async def finalizar_compra(
        session: Session,
        usuario: Usuario,
        datos_compra: CompraCreate
    ) -> CompraResponse: # <-- ¡CAMBIO 1: Tipo de retorno!
        
        # 1. Obtener el carrito
        carrito = await CarritoService.obtener_carrito_activo(session, usuario)
        session.refresh(carrito, ["items"]) 
        
        if not carrito.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El carrito está vacío"
            )

        # 2. Calcular totales y validar stock
        subtotal = 0.0
        total_iva = 0.0
        
        for item in carrito.items:
            producto = session.get(Producto, item.producto_id)
            if not producto:
                 raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Producto con ID {item.producto_id} no encontrado")
            
            if producto.existencia < item.cantidad:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stock insuficiente para '{producto.nombre}'"
                )
            
            precio_item = producto.precio * item.cantidad
            subtotal += precio_item

            if producto.categoria.lower() == "electrónicos":
                total_iva += precio_item * 0.10
            else:
                total_iva += precio_item * 0.21

        costo_envio = 0.0
        if subtotal < 1000:
            costo_envio = 50.0
            
        total_final = subtotal + total_iva + costo_envio

        # 3. Crear la Compra
        nueva_compra = Compra(
            usuario_id=usuario.id,
            fecha=datetime.now(),
            direccion=datos_compra.direccion,
            tarjeta=datos_compra.tarjeta,
            total=total_final,
            envio=costo_envio
        )
        session.add(nueva_compra)
        session.commit()
        session.refresh(nueva_compra)

        # 4. Mover items y actualizar stock
        items_a_eliminar = list(carrito.items) # Copia de la lista

        for item in items_a_eliminar:
            producto = session.get(Producto, item.producto_id)
            
            # Crear ItemCompra (historial)
            item_compra = ItemCompra(
                compra_id=nueva_compra.id,
                producto_id=producto.id,
                cantidad=item.cantidad,
                nombre=producto.nombre,
                precio_unitario=producto.precio
            )
            session.add(item_compra)
            
            # Restar Stock
            producto.existencia -= item.cantidad
            session.add(producto)
            
            # Borrar del carrito
            session.delete(item) 

        # Primer commit: Guardar items comprados y borrar del carrito
        session.commit()

        # 5. Actualizar estado del carrito
        carrito.estado = "finalizado"
        
        # Segundo commit: Actualizar estado del carrito
        session.commit() 
        
        session.refresh(nueva_compra)
        # Refrescamos para traer los items recién creados
        session.refresh(nueva_compra, ["items"]) 

        # --- ¡CAMBIO 2: Construcción manual de la respuesta! ---
        items_formateados = []
        for item in nueva_compra.items:
            items_formateados.append(
                ItemCarritoResponse( 
                    id=item.id,
                    producto_id=item.producto_id,
                    cantidad=item.cantidad,
                    nombre_producto=item.nombre,
                    precio_unitario=item.precio_unitario,
                    subtotal=item.cantidad * item.precio_unitario
                )
            )

        # Devolvemos el objeto CompraResponse completo que espera el frontend
        return CompraResponse(
            id=nueva_compra.id,
            usuario_id=nueva_compra.usuario_id,
            fecha=nueva_compra.fecha,
            direccion=nueva_compra.direccion,
            total=nueva_compra.total,
            envio=nueva_compra.envio,
            items=items_formateados 
        )
        # --- FIN DEL CAMBIO ---
    
    @staticmethod
    async def obtener_historial_compras(
        session: Session,
        usuario: Usuario
    ) -> List[CompraResumenResponse]:
        
        query = select(Compra).where(Compra.usuario_id == usuario.id).order_by(Compra.fecha.desc())
        compras = session.exec(query).all()
        
        resumenes = []
        for compra in compras:
            session.refresh(compra, ["items"]) 
            resumenes.append(
                CompraResumenResponse(
                    id=compra.id,
                    fecha=compra.fecha,
                    total=compra.total,
                    cantidad_items=len(compra.items)
                )
            )
        return resumenes

    @staticmethod
    async def obtener_detalle_compra(
        session: Session,
        usuario: Usuario,
        compra_id: int
    ) -> CompraResponse:
        
        query = select(Compra).where(
            Compra.id == compra_id,
            Compra.usuario_id == usuario.id
        )
        compra = session.exec(query).first()
        
        if not compra:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Compra no encontrada o no pertenece al usuario"
            )
        
        session.refresh(compra, ["items"])

        # Construcción manual de la respuesta para el frontend
        items_formateados = []
        for item in compra.items:
            items_formateados.append(
                ItemCarritoResponse(
                    id=item.id,
                    producto_id=item.producto_id,
                    cantidad=item.cantidad,
                    nombre_producto=item.nombre,
                    precio_unitario=item.precio_unitario,
                    subtotal=item.cantidad * item.precio_unitario
                )
            )

        return CompraResponse(
            id=compra.id,
            usuario_id=compra.usuario_id,
            fecha=compra.fecha,
            direccion=compra.direccion,
            total=compra.total,
            envio=compra.envio,
            items=items_formateados
        )