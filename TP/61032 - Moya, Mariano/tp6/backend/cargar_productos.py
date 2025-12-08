# Script para cargar productos iniciales desde productos.json a la base de datos
from models.db_models import Producto
from sqlmodel import Session
from init_db import engine
import json
from pathlib import Path

ruta_productos = Path(__file__).parent / "productos.json"

with open(ruta_productos, "r", encoding="utf-8") as archivo:
    productos = json.load(archivo)

with Session(engine) as session:
    for prod in productos:
        producto = Producto(
            nombre=prod.get("titulo", ""),
            descripcion=prod.get("descripcion", ""),
            precio=prod.get("precio", 0.0),
            categoria=prod.get("categoria", ""),
            existencia=prod.get("existencia", 0),
            imagen=prod.get("imagen", None)
        )
        session.add(producto)
    session.commit()
print("Productos iniciales cargados en la base de datos.")
