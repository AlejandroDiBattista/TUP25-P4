from sqlmodel import SQLModel, create_engine, Session
import os

# Configuración de la base de datos
DB_URL = os.getenv("DB_URL", "sqlite:///./app.db")
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})


# 🔧 Crear tablas
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


# 🧩 Proveer sesión de conexión a la DB
def get_session():
    with Session(engine) as session:
        yield session


# 🏁 Ejecutar directamente este archivo para crear la DB
if __name__ == "__main__":
    create_db_and_tables()

