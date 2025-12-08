from typing import Optional, List
from fastapi import HTTPException, status
from sqlmodel import Session, select
from models.models import Carrito, ItemCarrito, Producto, Usuario

# --- ¡IMPORTACIONES AÑADIDAS! ---
# Importamos los "moldes" (schemas) que necesitamos devolver
from schemas.carrito_schema import CarritoResponse, ItemCarritoResponse
# ---

class CarritoService:
    @staticmethod
    async def obtener_carrito_activo(session: Session, usuario: Usuario) -> Carrito:
        """Obtiene el carrito activo del usuario o crea uno nuevo si no existe"""
        query = select(Carrito).where(
            Carrito.usuario_id == usuario.id,
            Carrito.estado == "activo"
        )
        carrito = session.exec(query).first()
        
        if not carrito:
            carrito = Carrito(usuario_id=usuario.id, estado="activo")
            session.add(carrito)
            session.commit()
            session.refresh(carrito)
        
        return carrito

    @staticmethod
    async def agregar_producto(
        session: Session,
        usuario: Usuario,
        producto_id: int,
        cantidad: int
    ) -> ItemCarrito:
        """Agrega un producto al carrito"""
        # (Esta función está perfecta, ya la habíamos arreglado en main.py
        # para que devuelva un 'ItemCarritoSimpleResponse')
        producto = session.get(Producto, producto_id)
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        
        if producto.existencia <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Producto agotado"
            )
        
        if producto.existencia < cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No hay suficiente stock. Disponibles: {producto.existencia}"
            )

        carrito = await CarritoService.obtener_carrito_activo(session, usuario)

        query = select(ItemCarrito).where(
            ItemCarrito.carrito_id == carrito.id,
            ItemCarrito.producto_id == producto_id
        )
        item_existente = session.exec(query).first()

        if item_existente:
            nueva_cantidad = item_existente.cantidad + cantidad
            if nueva_cantidad > producto.existencia:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"No hay suficiente stock para agregar. Disponibles: {producto.existencia}, en carrito: {item_existente.cantidad}"
                )
            item_existente.cantidad = nueva_cantidad
            item = item_existente
        else:
            item = ItemCarrito(
                carrito_id=carrito.id,
                producto_id=producto_id,
                cantidad=cantidad
            )
            session.add(item)

        session.commit()
        session.refresh(item)
        return item

    @staticmethod
    async def quitar_producto(
        session: Session,
        usuario: Usuario,
        producto_id: int
    ) -> bool:
        """Quita un producto del carrito. Devuelve True si se eliminó."""
        # (Esta función está perfecta)
        carrito = await CarritoService.obtener_carrito_activo(session, usuario)
        
        query = select(ItemCarrito).where(
            ItemCarrito.carrito_id == carrito.id,
            ItemCarrito.producto_id == producto_id
        )
        item = session.exec(query).first()
        
        if not item:
            return False
        
        session.delete(item)
        session.commit()
        return True

    @staticmethod
    async def actualizar_cantidad(
        session: Session,
        usuario: Usuario,
        producto_id: int,
        cantidad: int
    ) -> ItemCarritoResponse: # <-- ¡CAMBIO 1: Tipo de retorno corregido!
        """Actualiza la cantidad de un producto en el carrito"""
        
        if cantidad <= 0:
            # (Tu lógica para borrar si la cantidad es 0 está bien)
            await CarritoService.quitar_producto(session, usuario, producto_id)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, # Aunque 200 estaría bien también
                detail="Producto eliminado. La cantidad no puede ser 0."
            )

        carrito = await CarritoService.obtener_carrito_activo(session, usuario)
        
        producto = session.get(Producto, producto_id)
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        
        if producto.existencia < cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No hay suficiente stock disponible. Disponibles: {producto.existencia}"
            )
        
        query = select(ItemCarrito).where(
            ItemCarrito.carrito_id == carrito.id,
            ItemCarrito.producto_id == producto_id
        )
        item = session.exec(query).first()
        
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, # (Tenías 44, lo corregí a 404)
                detail="Producto no encontrado en el carrito"
            )
        
        item.cantidad = cantidad
        session.add(item) # <-- Es bueno añadirlo para la sesión
        session.commit()
        session.refresh(item)
        
        # --- ¡CAMBIO 2: Devolvemos el "molde" complejo! ---
        return ItemCarritoResponse(
            id=item.id,
            producto_id=item.producto_id,
            cantidad=item.cantidad,
            nombre_producto=producto.nombre,
            precio_unitario=producto.precio,
            subtotal=producto.precio * item.cantidad
        )
        # ---

    @staticmethod
    async def obtener_carrito(
        session: Session,
        usuario: Usuario
    ) -> CarritoResponse: # <-- ¡CAMBIO 3: Tipo de retorno corregido!
        """Obtiene el carrito activo con todos sus items y cálculos"""
        
        # 1. Obtener el carrito de la BD (con sus items simples)
        carrito_db = await CarritoService.obtener_carrito_activo(session, usuario)
        session.refresh(carrito_db, ["items"]) # Cargar los items
        
        items_response_list: List[ItemCarritoResponse] = []
        total_carrito = 0.0
        cantidad_total_items = 0

        # 2. Recorrer los items y calcular los campos que faltan
        if carrito_db.items:
            for item in carrito_db.items:
                # Obtener el producto para sacar su nombre y precio
                producto = session.get(Producto, item.producto_id)
                
                if producto:
                    subtotal_item = producto.precio * item.cantidad
                    
                    # Construir el 'ItemCarritoResponse' (el "molde" complejo)
                    item_calculado = ItemCarritoResponse(
                        id=item.id,
                        producto_id=item.producto_id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,   # <-- Campo calculado
                        precio_unitario=producto.precio, # <-- Campo calculado
                        subtotal=subtotal_item          # <-- Campo calculado
                    )
                    items_response_list.append(item_calculado)
                    
                    # 3. Sumar a los totales del carrito
                    total_carrito += subtotal_item
                    cantidad_total_items += item.cantidad
                else:
                    # Opcional: manejar si un producto fue borrado pero seguía en el carrito
                    pass 

        # 4. Devolver el 'CarritoResponse' final (el "molde" que main.py espera)
        return CarritoResponse(
            id=carrito_db.id,
            estado=carrito_db.estado,
            items=items_response_list,
            total=total_carrito,
            cantidad_items=cantidad_total_items
        )

    @staticmethod
    async def vaciar_carrito(
        session: Session,
        usuario: Usuario
    ) -> None:
        """Vacía el carrito del usuario (para cancelar compra)"""
        # (Esta función está perfecta)
        carrito = await CarritoService.obtener_carrito_activo(session, usuario)
        
        if not carrito.items:
            return

        query = select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)
        items = session.exec(query).all()
        for item in items:
            session.delete(item)
        
        session.commit()