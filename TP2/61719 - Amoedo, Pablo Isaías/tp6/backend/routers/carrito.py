from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db.database import engine
from models.carrito import Carrito
from models.productos import Producto
from models.compras import Compra, CompraDetalle
from utils.security import obtener_usuario_actual
from pydantic import BaseModel
from datetime import datetime, timezone

router = APIRouter()


class CompraRequest(BaseModel):
    direccion: str
    tarjeta: str


def calcular_iva(producto_id: int, precio_unitario: float, cantidad: int, session: Session) -> dict:
    """Calcular IVA según categoría de producto (21% general, 10% electrónicos)"""
    producto = session.get(Producto, producto_id)
    
    subtotal_item = precio_unitario * cantidad
    
    # Categorías de electrónicos
    categorias_electronicas = ["electrónico", "electronicos", "electronics", "tech"]
    es_electronico = any(cat in producto.categoria.lower() for cat in categorias_electronicas)
    
    iva_rate = 0.10 if es_electronico else 0.21
    iva_item = subtotal_item * iva_rate
    
    return {
        "subtotal": subtotal_item,
        "iva": iva_item,
        "es_electronico": es_electronico
    }


class CarritoRequest(BaseModel):
    producto_id: int
    cantidad: int = 1

@router.post("/carrito")
def agregar_al_carrito(data: CarritoRequest, email: str = Depends(obtener_usuario_actual)):
    """Agregar producto al carrito"""
    with Session(engine) as session:
        producto = session.get(Producto, data.producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        if producto.existencia < data.cantidad:
            raise HTTPException(status_code=400, detail="Stock insuficiente")

        # Verificar si el producto ya existe en el carrito
        item_existente = session.exec(
            select(Carrito)
            .where(Carrito.usuario_email == email)
            .where(Carrito.producto_id == data.producto_id)
        ).first()

        if item_existente:
            item_existente.cantidad += data.cantidad
            session.add(item_existente)
        else:
            item = Carrito(
                usuario_email=email,
                producto_id=data.producto_id,
                cantidad=data.cantidad
            )
            session.add(item)

        session.commit()
        return {"mensaje": "Producto agregado al carrito"}



@router.get("/carrito")
def ver_carrito(email: str = Depends(obtener_usuario_actual)):
    """Ver contenido del carrito con cálculo de totales"""
    with Session(engine) as session:
        items = session.exec(
            select(Carrito, Producto)
            .join(Producto, Producto.id == Carrito.producto_id)
            .where(Carrito.usuario_email == email)
        ).all()

        if not items:
            return {
                "carrito": [],
                "subtotal": 0,
                "iva": 0,
                "envio": 0,
                "total": 0
            }

        carrito = []
        subtotal_total = 0
        iva_total = 0

        for carrito_item, producto in items:
            calc = calcular_iva(producto.id, producto.precio, carrito_item.cantidad, session)
            
            carrito.append({
                "carrito_id": carrito_item.id,
                "producto_id": producto.id,
                "nombre": producto.nombre,
                "imagen": f"/imagenes/{producto.id}.jpg",  # Ajustar según estructura
                "precio_unitario": producto.precio,
                "cantidad": carrito_item.cantidad,
                "subtotal": calc["subtotal"],
                "iva": calc["iva"]
            })
            
            subtotal_total += calc["subtotal"]
            iva_total += calc["iva"]

        # Calcular envío
        envio = 0 if subtotal_total > 1000 else 50

        return {
            "carrito": carrito,
            "subtotal": round(subtotal_total, 2),
            "iva": round(iva_total, 2),
            "envio": envio,
            "total": round(subtotal_total + iva_total + envio, 2)
        }


@router.delete("/carrito/{producto_id}")
def eliminar_producto_carrito(producto_id: int, email: str = Depends(obtener_usuario_actual)):
    """Eliminar producto del carrito"""
    with Session(engine) as session:
        item = session.exec(
            select(Carrito)
            .where(Carrito.usuario_email == email)
            .where(Carrito.producto_id == producto_id)
        ).first()

        if not item:
            raise HTTPException(status_code=404, detail="Producto no encontrado en el carrito")

        session.delete(item)
        session.commit()

        return {"mensaje": "Producto eliminado del carrito"}


@router.delete("/carrito")
def cancelar_carrito(email: str = Depends(obtener_usuario_actual)):
    """Cancelar compra - Vaciar carrito"""
    with Session(engine) as session:
        items = session.exec(
            select(Carrito).where(Carrito.usuario_email == email)
        ).all()

        if not items:
            raise HTTPException(status_code=400, detail="El carrito está vacío")

        for item in items:
            session.delete(item)
        
        session.commit()
        return {"mensaje": "Carrito vaciado"}


@router.post("/comprar")
def finalizar_compra(
    compra_data: CompraRequest,
    email: str = Depends(obtener_usuario_actual)
):
    """Finalizar compra - Crear registro de compra y vaciar carrito"""
    try:
        print(f"DEBUG: compra_data recibida = {compra_data}")
        print(f"DEBUG: email = {email}")
        with Session(engine) as session:
            items = session.exec(
                select(Carrito, Producto)
                .join(Producto, Producto.id == Carrito.producto_id)
                .where(Carrito.usuario_email == email)
            ).all()

            if not items:
                raise HTTPException(status_code=400, detail="El carrito está vacío")

            # Calcular totales
            subtotal_total = 0
            iva_total = 0
            detalles_compra = []

            for carrito_item, producto in items:
                if producto.existencia < carrito_item.cantidad:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Stock insuficiente para {producto.nombre}"
                    )

                calc = calcular_iva(producto.id, producto.precio, carrito_item.cantidad, session)
                
                subtotal_total += calc["subtotal"]
                iva_total += calc["iva"]

                detalles_compra.append({
                    "producto_id": producto.id,
                    "nombre_producto": producto.nombre,
                    "cantidad": carrito_item.cantidad,
                    "precio_unitario": producto.precio,
                    "subtotal": calc["subtotal"],
                    "iva": calc["iva"]
                })

                # Reducir stock
                producto.existencia -= carrito_item.cantidad
                session.add(producto)

            # Calcular envío
            envio = 0 if subtotal_total > 1000 else 50
            total = subtotal_total + iva_total + envio

            # Crear registro de compra
            compra = Compra(
                usuario_email=email,
                direccion=compra_data.direccion,
                tarjeta=compra_data.tarjeta,
                subtotal=round(subtotal_total, 2),
                iva=round(iva_total, 2),
                envio=envio,
                total=round(total, 2),
                fecha=datetime.now(timezone.utc)
            )
            session.add(compra)
            session.flush()  # Para obtener el ID de la compra

            # Crear detalles de compra
            for detalle in detalles_compra:
                detalle_compra = CompraDetalle(
                    compra_id=compra.id,
                    producto_id=detalle["producto_id"],
                    nombre_producto=detalle["nombre_producto"],
                    cantidad=detalle["cantidad"],
                    precio_unitario=detalle["precio_unitario"]
                )
                session.add(detalle_compra)

            # Eliminar items del carrito
            for carrito_item, _ in items:
                session.delete(carrito_item)

            session.commit()

            return {
                "mensaje": "Compra realizada con éxito",
                "compra_id": compra.id,
                "resumen": detalles_compra,
                "subtotal": round(subtotal_total, 2),
                "iva": round(iva_total, 2),
                "envio": envio,
                "total": round(total, 2)
            }
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR en /comprar: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
