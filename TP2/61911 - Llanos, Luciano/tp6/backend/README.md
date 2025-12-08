# E-Commerce Backend API

API Backend para sistema de comercio electrónico desarrollado con FastAPI y SQLModel.

## 📋 Características

- **FastAPI**: Framework web moderno y rápido para Python
- **SQLModel**: ORM moderno compatible con Pydantic
- **SQLite**: Base de datos ligera y fácil de usar
- **JWT Authentication**: Autenticación segura con tokens
- **CORS**: Configurado para frontend React/Next.js
- **Documentación automática**: Swagger UI integrado

## 🚀 Instalación y Ejecución

### Requisitos Previos

- Python 3.11 o superior
- pip o uv (recomendado)

### Instalación de Dependencias

```bash
# Con uv (recomendado)
uv sync

# Con pip
pip install -r requirements.txt
```

### Ejecución del Servidor

```bash
# Con uv
uv run uvicorn main:app --reload

# Con Python directo
python -m uvicorn main:app --reload

# Ejecutar main.py directamente
python main.py
```

El servidor estará disponible en: http://localhost:8000

## 📚 Documentación

- **API Docs**: http://localhost:8000/docs
- **Redoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## 🏗️ Estructura del Proyecto

```
backend/
├── main.py              # Aplicación principal FastAPI
├── pyproject.toml       # Dependencias y configuración
├── productos.json       # Datos iniciales de productos
├── imagenes/           # Imágenes de productos
├── models/             # Modelos SQLModel
├── database.py         # Configuración de base de datos
├── auth.py            # Sistema de autenticación
└── api-tests.http     # Pruebas con REST Client
```

## 🛠️ Tecnologías Utilizadas

- **FastAPI** - Framework web
- **SQLModel** - ORM y validación de datos
- **SQLite** - Base de datos
- **Uvicorn** - Servidor ASGI
- **JWT** - Autenticación
- **Bcrypt** - Hash de contraseñas

## 👨‍💻 Autor

**Luciano Llanos** - Estudiante de Programación 4