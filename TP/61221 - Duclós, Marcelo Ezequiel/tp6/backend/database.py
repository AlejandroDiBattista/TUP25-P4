"""Configuración de la base de datos SQLite"""

from sqlmodel import SQLModel, create_engine, Session
import os
from pathlib import Path

# Configuración de la base de datos
DATABASE_FILE = "tienda.db"
DATABASE_URL = f"sqlite:///{DATABASE_FILE}"

# Crear el engine de SQLModel
engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    """Crear todas las tablas de la base de datos"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Obtener una sesión de base de datos"""
    with Session(engine) as session:
        yield session

def init_database():
    """Inicializar la base de datos con las tablas"""
    # Importar todos los modelos para que SQLModel los reconozca
    from models import (
        Usuario, Producto, Carrito, ItemCarrito, 
        Compra, ItemCompra
    )
    
    # Crear las tablas
    create_db_and_tables()
    print("Base de datos inicializada correctamente")

if __name__ == "__main__":
    init_database()