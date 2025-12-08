from sqlmodel import SQLModel, create_engine
from pathlib import Path

# Configuración de la base de datos SQLite
DB_PATH = Path(__file__).parent.parent / "db.sqlite3"
engine = create_engine(f"sqlite:///{DB_PATH}", echo=True)

def init_db():
    from models.db_models import Usuario, Producto, Carrito, CarritoItem, Compra, CompraItem
    SQLModel.metadata.create_all(engine)

if __name__ == "__main__":
    init_db()
    print("Base de datos inicializada correctamente.")
