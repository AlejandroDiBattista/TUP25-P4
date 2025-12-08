"""
Configuración de la base de datos SQLite con SQLModel
"""
from sqlmodel import create_engine, SQLModel, Session, select
import json
from pathlib import Path
from typing import Generator

# URL de la base de datos SQLite
DATABASE_URL = "sqlite:///./ecommerce.db"

# Crear el engine de la base de datos
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Mostrar las consultas SQL en desarrollo
    connect_args={"check_same_thread": False}  # Necesario para SQLite
)

def crear_tablas():
    """Crear todas las tablas en la base de datos"""
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    """Dependency para obtener una sesión de base de datos"""
    with Session(engine) as session:
        yield session

def inicializar_datos():
    """Cargar datos iniciales desde productos.json"""
    from models.productos import Producto
    from models.usuarios import Usuario
    from models.carrito import Carrito, CarritoItem
    from models.pedidos import Pedido, PedidoItem
    
    with Session(engine) as session:
        # Verificar si ya hay productos
        existing_products = session.exec(select(Producto)).first()
        if existing_products:
            print("Los productos ya están cargados en la base de datos")
            return
        
        # Cargar productos desde JSON
        ruta_productos = Path(__file__).parent / "productos.json"
        with open(ruta_productos, "r", encoding="utf-8") as archivo:
            productos_data = json.load(archivo)
        
        # Crear productos en la base de datos
        productos = []
        for producto_data in productos_data:
            producto = Producto(
                id=producto_data["id"],
                titulo=producto_data["titulo"],
                precio=producto_data["precio"],
                descripcion=producto_data["descripcion"],
                categoria=producto_data["categoria"],
                valoracion=producto_data["valoracion"],
                existencia=producto_data["existencia"],
                imagen=producto_data["imagen"]
            )
            productos.append(producto)
        
        session.add_all(productos)
        session.commit()
        print(f"Se cargaron {len(productos)} productos en la base de datos")