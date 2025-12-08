from sqlmodel import SQLModel, create_engine, Session
import json
from models.productos import Producto

engine = create_engine("sqlite:///tienda.db")

def init_db():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        with open("productos.json", "r", encoding="utf-8") as f:
            productos = json.load(f)
            for p in productos:
                producto = Producto(**p)
                session.add(producto)
        session.commit()
