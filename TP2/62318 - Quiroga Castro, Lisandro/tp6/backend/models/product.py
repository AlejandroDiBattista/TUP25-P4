from fastapi import APIRouter
import json
from pathlib import Path

router = APIRouter(prefix="/productos")

def cargar_productos():
    ruta = Path(__file__).parent.parent / "productos.json"
    with open(ruta, "r", encoding="utf-8") as file:
        productos = json.load(file)
        return productos

@router.get("/")
def obtener_productos():
    return cargar_productos()

@router.get("/{id}")
def obtener_producto(id: int):
    productos = cargar_productos()
    for p in productos:
        if p["id"] == id:
            return p
    return {"error": "Producto no encontrado"}
