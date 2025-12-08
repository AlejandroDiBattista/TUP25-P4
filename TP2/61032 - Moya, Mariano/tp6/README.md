# TP6 - Comercio Electrónico
## Estructura

- **backend/**
  - API RESTful con FastAPI, SQLModel y SQLite
  - Datos iniciales en `productos.json`
  - Imágenes de productos en `imagenes/`
  - Modelos en `models/`
  - Pruebas en `api-tests.http` y configuración en `pytest.ini`

- **frontend/**
  - Aplicación Next.js con Tailwind CSS y Shadcn UI
  - Componentes en `app/components/`
  - Servicios en `app/services/`
  - Configuración en `package.json`, `tsconfig.json`, etc.

## Instalación y ejecución

### Backend
1. Instalar dependencias:
   ```sh
   cd backend
   pip install -r requirements.txt  # o usar pyproject.toml con poetry/pdm
   ```
2. Ejecutar servidor:
   ```sh
   uvicorn main:app --reload
   ```

### Frontend
1. Instalar dependencias:
   ```sh
   cd frontend
   npm install
   ```
2. Ejecutar servidor:
   ```sh
   npm run dev
   ```

## Datos iniciales
- Los productos se cargan desde `backend/productos.json`.
- Las imágenes deben estar en `backend/imagenes/` y referenciadas correctamente.


---.