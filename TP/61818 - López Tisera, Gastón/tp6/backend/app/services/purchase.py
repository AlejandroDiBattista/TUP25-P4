from sqlmodel import Session, select

from app.models import Purchase, User


def list_purchases(session: Session, user: User) -> list[Purchase]:
    statement = (
        select(Purchase)
        .where(Purchase.usuario_id == user.id)
        .order_by(Purchase.fecha.desc())
    )
    return session.exec(statement).all()


def get_purchase(session: Session, user: User, purchase_id: int) -> Purchase:
    purchase = session.get(Purchase, purchase_id)
    if not purchase or purchase.usuario_id != user.id:
        raise ValueError("Compra no encontrada.")
    return purchase

