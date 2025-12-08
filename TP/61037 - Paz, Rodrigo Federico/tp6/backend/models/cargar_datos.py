import json
from pathlib import Path
from sqlmodel import Session, select
from models.database import engine
from models.productos import Producto

def cargar_productos_iniciales():
    """Carga los productos desde productos.json a la base de datos si la tabla está vacía."""
    ruta = Path(__file__).parent.parent / "productos.json"

    with Session(engine) as session:
        
        resultado = session.exec(select(Producto)).all()
        if resultado:
            print("✅ Los productos ya están cargados en la base de datos.")
            return

       
        with open(ruta, "r", encoding="utf-8") as archivo:
            productos_json = json.load(archivo)

        
        for p in productos_json:
            nuevo_producto = Producto(
                id=p.get("id"),
                nombre=p.get("nombre") or p.get("titulo"),
                descripcion=p.get("descripcion"),
                precio=p.get("precio"),
                categoria=p.get("categoria"),
                existencia=p.get("existencia"),
                imagen=p.get("imagen")
            )
            session.add(nuevo_producto)

        session.commit()
        print("🎉 Productos iniciales cargados exitosamente.")