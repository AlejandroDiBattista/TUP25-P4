"""
Configuración de la base de datos SQLite con SQLModel.

Basado en las prácticas de clase (21.agenda-front-back/backend/database.py)
"""
from sqlmodel import create_engine, SQLModel, Session
from pathlib import Path
from typing import Generator


# ==================== CONFIGURACIÓN ====================

# Ubicar la base de datos en la carpeta del proyecto
DB_PATH = Path(__file__).parent / "ecommerce.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Configuración del engine con opciones para SQLite
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Cambiar a True para ver las queries SQL en consola (debug)
    connect_args={"check_same_thread": False}  # Necesario para SQLite con FastAPI
)


# ==================== FUNCIONES ====================

def crear_tablas():
    """
    Crea todas las tablas definidas en los modelos.
    
    Se debe llamar una vez al iniciar la aplicación.
    SQLModel detecta automáticamente todos los modelos con table=True.
    """
    SQLModel.metadata.create_all(engine)
    print("✅ Tablas creadas exitosamente")


def borrar_tablas():
    """
    Elimina todas las tablas de la base de datos.
    
    ⚠️ ADVERTENCIA: Esta operación es irreversible.
    Solo usar en desarrollo/testing.
    """
    SQLModel.metadata.drop_all(engine)
    print("⚠️ Todas las tablas han sido eliminadas")


# ==================== DEPENDENCIAS ====================

def get_session() -> Generator[Session, None, None]:
    """
    Dependencia para obtener una sesión de base de datos.
    
    Se usa con Depends() en los endpoints de FastAPI.
    La sesión se cierra automáticamente después de cada request.
    Los cambios se commitean automáticamente si no hay errores.
    
    Ejemplo de uso:
        @app.get("/usuarios")
        def get_usuarios(session: Session = Depends(get_session)):
            usuarios = session.exec(select(Usuario)).all()
            return usuarios
    """
    with Session(engine) as session:
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
