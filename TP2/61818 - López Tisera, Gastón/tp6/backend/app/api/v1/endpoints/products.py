from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.api.deps import get_db
from app.models.product import Product
from app.schemas import ProductRead

router = APIRouter(prefix="/productos", tags=["productos"])


@router.get("/", response_model=list[ProductRead])
def list_products(
    session: Session = Depends(get_db),
    search: str | None = Query(default=None, description="Buscar por título o descripción"),
    categoria: str | None = Query(default=None, description="Filtrar por categoría exacta"),
) -> list[ProductRead]:
    """Listar productos con filtros opcionales."""
    statement = select(Product)

    if search:
        search_pattern = f"%{search.lower()}%"
        statement = statement.where(
            (Product.titulo.ilike(search_pattern))
            | (Product.descripcion.ilike(search_pattern))
        )

    if categoria:
        statement = statement.where(Product.categoria == categoria)

    statement = statement.order_by(Product.titulo.asc())
    productos = session.exec(statement).all()
    return [ProductRead.model_validate(prod) for prod in productos]


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, session: Session = Depends(get_db)) -> ProductRead:
    """Obtener un producto por su ID."""
    producto = session.get(Product, product_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado.",
        )
    return ProductRead.model_validate(producto)

