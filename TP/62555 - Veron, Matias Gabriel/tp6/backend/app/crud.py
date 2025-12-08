from sqlmodel import Session, select
from app.models.productos import Producto

def get_all_products(db: Session, q: str = None, categoria: str = None):
    stmt = select(Producto)
    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where((Producto.nombre.ilike(like)) | (Producto.descripcion.ilike(like)))
    if categoria:
        stmt = stmt.where(Producto.categoria == categoria)
    return db.exec(stmt).all()
