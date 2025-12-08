from sqlmodel import SQLModel, create_engine, Session
from models import Usuario, Producto, Carrito, ItemCarrito, Compra, ItemCompra

# Base de datos SQLite
DATABASE_URL = "sqlite:///./ecommerce.db"

engine = create_engine(DATABASE_URL, echo=True)

def init_db():
    """Crear todas las tablas en la base de datos"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Obtener sesión de base de datos"""
    with Session(engine) as session:
        yield session

