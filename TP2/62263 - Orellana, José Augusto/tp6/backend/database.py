from sqlmodel import SQLModel, create_engine, Session

# Se importa los modelos
from models.productos import Producto
from models.usuarios import Usuario
from models.carrito import Carrito, CarritoItem
from models.compras import Compra, ItemCompra

# 1. Se define el archivo de la base de datos
sqlite_file_name = "database.db"

# Esta es la URL de conexión para SQLite
sqlite_url = f"sqlite:///{sqlite_file_name}"

# 2. Se crea el motor de la base de datos
engine = create_engine(sqlite_url, echo=True)

# 3. Función para crear las tablas en la base de datos
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# 4. Fábrica de sesiones para inyectar dependencias
def get_session():
    # Se crea una sesión con el motor
    with Session(engine) as session:
        yield session

    # Al salir del bloque with, la sesión se cierra automáticamente