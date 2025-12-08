# Backend - E-commerce API

API RESTful desarrollada con FastAPI para el sitio de comercio electrónico.

## Instalación

1. Crear entorno virtual:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. Instalar dependencias:
```bash
pip install -r requirements.txt
```

3. Cargar productos iniciales:
```bash
python load_products.py
```

4. Ejecutar servidor:
```bash
uvicorn main:app --reload
```

El servidor estará disponible en `http://localhost:8000`

## Documentación de la API

Una vez que el servidor esté corriendo, puedes acceder a:
- Documentación interactiva: `http://localhost:8000/docs`
- Documentación alternativa: `http://localhost:8000/redoc`

## Estructura

- `main.py`: Punto de entrada de la aplicación
- `database.py`: Configuración de la base de datos
- `models.py`: Modelos de datos (SQLModel)
- `schemas.py`: Schemas Pydantic para validación
- `auth.py`: Utilidades de autenticación JWT
- `routers/`: Módulos de endpoints
  - `auth.py`: Autenticación
  - `productos.py`: Productos
  - `carrito.py`: Carrito de compras
  - `compras.py`: Historial de compras
- `tests/`: Pruebas unitarias
- `load_products.py`: Script para cargar productos iniciales

## Pruebas

Ejecutar pruebas:
```bash
pytest
```

Ejecutar con cobertura:
```bash
pytest --cov=. --cov-report=html
```

