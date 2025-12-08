from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db.database import engine
from models.compras import Compra, CompraDetalle
from utils.security import obtener_usuario_actual

router = APIRouter()


@router.get("/compras")
def obtener_historial_compras(email: str = Depends(obtener_usuario_actual)):
    """Ver resumen de todas las compras del usuario"""
    with Session(engine) as session:
        compras = session.exec(
            select(Compra).where(Compra.usuario_email == email).order_by(Compra.fecha.desc())
        ).all()

        if not compras:
            return {"compras": []}

        return {
            "compras": [
                {
                    "compra_id": compra.id,
                    "fecha": compra.fecha.isoformat(),
                    "total": compra.total,
                    "estado": "Completada"
                }
                for compra in compras
            ]
        }


@router.get("/compras/{compra_id}")
def obtener_detalle_compra(compra_id: int, email: str = Depends(obtener_usuario_actual)):
    """Ver detalle de una compra específica"""
    with Session(engine) as session:
        compra = session.get(Compra, compra_id)
        
        if not compra or compra.usuario_email != email:
            raise HTTPException(status_code=404, detail="Compra no encontrada")

        # Obtener detalles de la compra
        detalles = session.exec(
            select(CompraDetalle).where(CompraDetalle.compra_id == compra_id)
        ).all()

        return {
            "compra_id": compra.id,
            "fecha": compra.fecha.isoformat(),
            "direccion": compra.direccion,
            "tarjeta": compra.tarjeta,
            "productos": [
                {
                    "producto_id": detalle.producto_id,
                    "nombre": detalle.nombre_producto,
                    "cantidad": detalle.cantidad,
                    "precio_unitario": detalle.precio_unitario,
                    "subtotal": detalle.precio_unitario * detalle.cantidad
                }
                for detalle in detalles
            ],
            "subtotal": compra.subtotal,
            "iva": compra.iva,
            "envio": compra.envio,
            "total": compra.total
        }
