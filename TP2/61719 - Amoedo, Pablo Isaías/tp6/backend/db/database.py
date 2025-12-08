from sqlmodel import SQLModel, create_engine, Session, select
import json
import os
from models.productos import Producto

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=False)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def load_initial_data():
    """Cargar datos iniciales de productos"""
    with Session(engine) as session:
        # Contar productos existentes
        count = len(session.exec(select(Producto)).all())
        if count > 0:
            return

        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(current_dir)
        json_file = os.path.join(backend_dir, "productos.json")
        
        with open(json_file, "r", encoding="utf-8") as f:
            productos_data = json.load(f)

        for item in productos_data:
            # Usar "titulo" como "nombre"
            if "titulo" in item:
                item["nombre"] = item.pop("titulo")
            # Eliminar campos que no existen en el modelo
            item.pop("valoracion", None)
            item.pop("imagen", None)
            
            producto = Producto(**item)
            session.add(producto)

        session.commit()