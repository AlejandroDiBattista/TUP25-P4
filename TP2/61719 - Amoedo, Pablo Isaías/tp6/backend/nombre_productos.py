from sqlmodel import Session
from db.database import engine
from models.productos import Producto

# Lista de nombres para los productos (ordenados por ID)
nombres = [
    "Mochila resistente",
    "Camiseta entallada",
    "Chaqueta de algodón",
    "Prenda casual",
    "Pulsera Legends Naga",
    "Anillo de oro micropavé",
    "Anillo princesa",
    "Aros Pierced Owl",
    "Disco duro WD 2TB",
    "SanDisk SSD Plus 1TB",
    "Silicon Power SSD 256GB",
    "Disco externo WD 4TB",
    "Monitor Acer SB220Q",
    "Monitor curvo Samsung",
    "Chaqueta snowboard mujer",
    "Chaqueta biker sintética",
    "Chaqueta impermeable",
    "Camiseta cuello barco",
    "Camiseta Opna",
    "Camiseta Danvouy"
]

with Session(engine) as session:
    for i, nombre in enumerate(nombres, start=1):
        producto = session.get(Producto, i)
        if producto:
            producto.nombre = nombre
            session.add(producto)
    session.commit()

print("✅ Nombres de productos actualizados correctamente.")
