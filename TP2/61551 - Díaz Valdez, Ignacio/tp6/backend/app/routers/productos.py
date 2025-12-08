from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from sqlmodel import select
from sqlalchemy import func
from collections import OrderedDict
from pathlib import Path
import json
from ..database import get_session
from models import Producto

router = APIRouter(prefix="/productos", tags=["productos"])

PRODUCTOS_JSON = Path(__file__).resolve().parent.parent.parent / "productos.json"

@router.get("")
def obtener_productos(
    q: Optional[str] = Query(None, alias="buscar"),
    categoria: Optional[str] = None,
):
    try:
        with get_session() as session:
            consulta = select(Producto)
            if categoria:
                consulta = consulta.where(Producto.categoria == categoria)
            if q:
                qn = f"%{q.strip().lower()}%"
                consulta = consulta.where(
                    func.lower(Producto.titulo).like(qn)
                    | func.lower(Producto.descripcion).like(qn)
                    | func.lower(Producto.categoria).like(qn)
                )
            resultados = session.exec(consulta).all()
            if resultados:
                claves = ["id","titulo","precio","descripcion","categoria","valoracion","existencia","imagen"]
                lista = []
                for p in resultados:
                    try:
                        base = p.model_dump(exclude_none=True)  # type: ignore[attr-defined]
                    except AttributeError:
                        base = p.dict(exclude_none=True)
                    ordenado = OrderedDict()
                    for k in claves:
                        if k in base:
                            ordenado[k] = base[k]
                    for k,v in base.items():
                        if k not in ordenado:
                            ordenado[k] = v
                    lista.append(ordenado)
                return {"value": lista, "Count": len(lista)}
    except Exception:
        pass
    # Fallback JSON
    try:
        with open(PRODUCTOS_JSON, "r", encoding="utf-8") as f:
            lista = json.load(f)
        if categoria:
            lista = [p for p in lista if str(p.get("categoria","")) == categoria]
        if q:
            qn = q.strip().lower()
            def coincide(p: dict) -> bool:
                tit = str(p.get("titulo","" )).lower()
                desc = str(p.get("descripcion","" )).lower()
                cat = str(p.get("categoria","" )).lower()
                return (qn in tit) or (qn in desc) or (qn in cat)
            lista = [p for p in lista if coincide(p)]
        return {"value": lista, "Count": len(lista)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"No se pudieron obtener productos: {e}")

@router.get("/{producto_id}")
def obtener_producto_por_id(producto_id: int):
    claves = ["id","titulo","precio","descripcion","categoria","valoracion","existencia","imagen"]
    try:
        with get_session() as session:
            p = session.exec(select(Producto).where(Producto.id == producto_id)).first()
            if p:
                try:
                    base = p.model_dump(exclude_none=True)  # type: ignore[attr-defined]
                except AttributeError:
                    base = p.dict(exclude_none=True)
                ordenado = OrderedDict()
                for k in claves:
                    if k in base:
                        ordenado[k] = base[k]
                for k,v in base.items():
                    if k not in ordenado:
                        ordenado[k] = v
                return ordenado
    except Exception:
        pass
    try:
        with open(PRODUCTOS_JSON, "r", encoding="utf-8") as f:
            lista = json.load(f)
        for item in lista:
            if item.get("id") == producto_id:
                ordenado = OrderedDict()
                for k in claves:
                    if k in item:
                        ordenado[k] = item[k]
                for k,v in item.items():
                    if k not in ordenado:
                        ordenado[k] = v
                return ordenado
    except Exception:
        pass
    raise HTTPException(status_code=404, detail="Producto no encontrado")
