import json
from sqlmodel import Session, select
from database import engine
from models.productos import Producto

# Carga el JSON original
with open("productos.json", "r", encoding="utf-8") as f:
    data = json.load(f)

with Session(engine) as session:
    for prod_json in data:
        producto_db = session.exec(select(Producto).where(Producto.id == prod_json["id"])).first()
        if producto_db:
            producto_db.existencia = prod_json["existencia"]
            session.add(producto_db)
            print(f"✔ Actualizado {producto_db.titulo} → existencia {prod_json['existencia']}")
    session.commit()

print("Existencias sincronizadas con el JSON correctamente.")
