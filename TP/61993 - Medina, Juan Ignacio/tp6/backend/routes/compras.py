from fastapi import APIRouter, HTTPException, Header
from sqlmodel import select
from db import get_session
from models import Compra, CompraItem
import auth as _auth

router = APIRouter()

def get_user_from_token(authorization: str = Header(...)):
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Token inválido")
    token = parts[1]
    if _auth.is_token_blacklisted(token):
        raise HTTPException(status_code=401, detail="Token invalidado")
    payload = _auth.decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    return payload

@router.get("/")
def listar_compras(authorization: str = Header(...)):
    payload = get_user_from_token(authorization)
    user_id = int(payload.get("sub"))
    session = get_session()
    compras = session.exec(select(Compra).where(Compra.usuario_id == user_id)).all()
    out = []
    for c in compras:
        out.append({
            "id": c.id,
            "fecha": c.fecha.isoformat(),
            "direccion": c.direccion,
            "tarjeta": c.tarjeta,
            "total": c.total,
            "envio": c.envio
        })
    return out

@router.get("/{compra_id}")
def detalle_compra(compra_id: int, authorization: str = Header(...)):
    payload = get_user_from_token(authorization)
    user_id = int(payload.get("sub"))
    session = get_session()
    compra = session.get(Compra, compra_id)
    if not compra or compra.usuario_id != user_id:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    items = session.exec(select(CompraItem).where(CompraItem.compra_id == compra.id)).all()
    detalles = []
    for it in items:
        detalles.append({
            "producto_id": it.producto_id,
            "nombre": it.nombre,
            "cantidad": it.cantidad,
            "precio_unitario": it.precio_unitario
        })
    return {
        "id": compra.id,
        "fecha": compra.fecha.isoformat(),
        "direccion": compra.direccion,
        "tarjeta": compra.tarjeta,
        "total": compra.total,
        "envio": compra.envio,
        "items": detalles
    }
