# Trabajos Prácticos - Programación 4

Este repositorio contiene los enunciados y recursos para los trabajos prácticos de la materia Programación 4.

## Estructura del Repositorio

```
└── tp6/              # Trabajo Práctico 6 - E-Commerce
    ├── backend/      # API con FastAPI
    ├── frontend/     # Aplicación con Next.js
    └── README.md     # Instrucciones detalladas
```

## TP6 - E-Commerce con FastAPI y Next.js

El TP6 es un proyecto full-stack que consiste en desarrollar un sitio de comercio electrónico con las siguientes tecnologías:

- **Backend**: FastAPI + SQLModel + SQLite
- **Frontend**: Next.js 16 + React 19 + Tailwind CSS

### Inicio Rápido

#### 1. Configurar el Backend

```powershell
# Navegar a la carpeta del backend
cd enunciados\tp6\backend

# Instalar dependencias
uv sync

# Iniciar el servidor
uv run uvicorn main:app --reload
```

El backend estará disponible en: **http://localhost:8000**

#### 2. Configurar el Frontend

```powershell
# Abrir nueva terminal y navegar a la carpeta del frontend
cd enunciados\tp6\frontend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

El frontend estará disponible en: **http://localhost:3000**

### Verificar la Instalación

**Backend:**
- Abrir http://localhost:8000
- Deberías ver: `{"mensaje": "API de Productos - use /productos para obtener el listado"}`
- Documentación: http://localhost:8000/docs

**Frontend:**
- Abrir http://localhost:3000
- Deberías ver el catálogo de productos con imágenes

### Requisitos Previos

Antes de comenzar, necesitas tener instalado:

1. **Python 3.13 o superior**
   - Descargar desde: https://www.python.org/downloads/
   - Durante la instalación, marcar "Add Python to PATH"

2. **Node.js 20 o superior**
   - Descargar desde: https://nodejs.org/
   - Instalar la versión LTS

3. **uv (Gestor de paquetes Python)**
   ```powershell
   powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```


### Estructura del Proyecto TP6

```
tp6/
├── backend/
│   ├── main.py              # Punto de entrada de la API
│   ├── models/              # Modelos de base de datos
│   │   ├── __init__.py
│   │   └── productos.py
│   ├── productos.json       # Datos iniciales
│   ├── imagenes/            # Imágenes de productos
│   ├── api-tests.http       # Pruebas REST Client
│   ├── pyproject.toml       # Dependencias Python
│   └── README.md
│
└── frontend/
    ├── app/
    │   ├── page.tsx         # Página principal
    │   ├── layout.tsx       # Layout general
    │   ├── globals.css      # Estilos globales
    │   ├── components/      # Componentes React
    │   │   └── ProductoCard.tsx
    │   ├── services/        # Servicios de API
    │   │   └── productos.ts
    │   └── types.ts         # Tipos TypeScript
    ├── public/              # Archivos estáticos
    ├── package.json         # Dependencias Node.js
    ├── next.config.ts       # Configuración Next.js
    ├── tailwind.config.js   # Configuración Tailwind
    └── tsconfig.json        # Configuración TypeScript
```

