import json
from pathlib import Path
from typing import List, Optional
from sqlmodel import Session, select
from models.models import Producto
from schemas.producto_schema import ProductoFilter

class ProductoService:
    @staticmethod
    async def cargar_productos_iniciales(session: Session):
        """Carga los productos desde el archivo JSON si la base de datos está vacía"""
        # Verificar si ya hay productos
        productos_existentes = session.exec(select(Producto)).first()
        if productos_existentes:
            return
        
        # Cargar productos del JSON
        ruta_productos = Path(__file__).parent.parent / "productos.json"
        with open(ruta_productos, "r", encoding="utf-8") as archivo:
            productos_json = json.load(archivo)
            
        for producto_data in productos_json:
            producto = Producto(
                id=producto_data["id"],
                nombre=producto_data["titulo"],
                descripcion=producto_data["descripcion"],
                precio=producto_data["precio"],
                categoria=producto_data["categoria"],
                existencia=producto_data["existencia"]
            )
            session.add(producto)
        session.commit()

    @staticmethod
    async def obtener_productos(
        session: Session,
        filtros: Optional[ProductoFilter] = None
    ) -> List[Producto]:
        """Obtiene lista de productos con filtros opcionales"""
        query = select(Producto)
        
        if filtros:
            if filtros.busqueda:
                search = f"%{filtros.busqueda}%"
                query = query.where(
                    (Producto.nombre.ilike(search)) | 
                    (Producto.descripcion.ilike(search))
                )
            
            if filtros.categoria:
                query = query.where(Producto.categoria == filtros.categoria)
            
            if filtros.precio_min is not None:
                query = query.where(Producto.precio >= filtros.precio_min)
            
            if filtros.precio_max is not None:
                query = query.where(Producto.precio <= filtros.precio_max)
            
            if filtros.disponibles:
                query = query.where(Producto.existencia > 0)
        
        return list(session.exec(query))

    @staticmethod
    async def obtener_producto(session: Session, producto_id: int) -> Optional[Producto]:
        """Obtiene un producto por su ID"""
        return session.get(Producto, producto_id)

    @staticmethod
    async def obtener_categorias(session: Session) -> List[str]:
        """Obtiene lista de categorías únicas"""
        query = select(Producto.categoria).distinct()
        return [row[0] for row in session.exec(query)]