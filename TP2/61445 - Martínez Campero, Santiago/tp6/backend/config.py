"""Configuración de la aplicación FastAPI."""

from pathlib import Path
from datetime import timedelta

# Rutas
BASE_DIR = Path(__file__).parent
DATABASE_URL = "sqlite:///./database.db"

# Seguridad JWT
SECRET_KEY = "tp6-ecommerce-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 horas para facilitar el testing

# CORS
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://192.168.1.109:3000",  # Red local
    "*",  # Permitir todos durante desarrollo
]

# Reglas de negocio
IVA_STANDARD = 0.21  # 21% para productos normales
IVA_ELECTRONICA = 0.10  # 10% para electrónica
SHIPPING_FREE_THRESHOLD = 1000.0  # Envío gratis si total > $1000
SHIPPING_COST = 50.0  # Costo fijo de envío

# Categorías de electrónica
ELECTRONICS_CATEGORIES = ["Electrónica"]
