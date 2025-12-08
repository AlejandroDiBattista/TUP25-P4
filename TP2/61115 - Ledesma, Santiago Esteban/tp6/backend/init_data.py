import json
from sqlmodel import Session
from db import engine
from models import Producto

# Cargar los datos del JSON
with open("productos.json", "r", encoding="utf-8") as f:
    productos_data = json.load(f)

# Insertar productos en la base
with Session(engine) as session:
    for p in productos_data:
        producto = Producto(
            nombre=p["titulo"],
            descripcion=p["descripcion"],
            precio=p["precio"],
            categoria=p["categoria"],
            existencia=p["existencia"],
            imagen=p["imagen"],
            valoracion=p.get("valoracion", 0)
        )
        session.add(producto)
    session.commit()

print("✅ Productos cargados correctamente.")
