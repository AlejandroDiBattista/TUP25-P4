# TP6 - E-Commerce con FastAPI y Next.js

Desarrollo de un sitio de comercio electrónico simple utilizando React (Next.js) para el frontend y FastAPI para el backend.

## Estructura del Proyecto

```
tp6/
├── backend/          # API FastAPI
│   ├── main.py       # Archivo principal de la API
│   ├── models/       # Modelos SQLModel
│   │   ├── __init__.py
│   │   ├── productos.py
│   │   ├── usuarios.py
│   │   ├── carrito.py
│   │   └── pedidos.py
│   ├── productos.json # Datos iniciales
│   ├── imagenes/     # Imágenes de productos (20 PNG)
│   ├── database.py   # Configuración de base de datos
│   ├── auth.py       # Sistema de autenticación JWT
│   ├── api-tests.http # Pruebas REST Client
│   ├── pyproject.toml # Dependencias Python
│   └── README.md
├── frontend/         # Aplicación Next.js
│   ├── app/
│   │   ├── page.tsx         # Página principal
│   │   ├── layout.tsx       # Layout general
│   │   ├── globals.css      # Estilos globales
│   │   ├── components/      # Componentes React
│   │   │   └── ProductoCard.tsx
│   │   ├── services/        # Servicios de API
│   │   │   └── productos.ts
│   │   └── types.ts         # Tipos TypeScript
│   ├── public/              # Archivos estáticos
│   ├── package.json         # Dependencias Node.js
│   ├── next.config.ts       # Configuración Next.js
│   ├── tailwind.config.js   # Configuración Tailwind
│   └── tsconfig.json        # Configuración TypeScript
└── README.md         # Este archivo
```

## Requisitos Previos

### Windows

1. **Python 3.13 o superior**
   - Descargar desde: https://www.python.org/downloads/
   - Durante la instalación, marcar la opción "Add Python to PATH"

2. **Node.js 20 o superior**
   - Descargar desde: https://nodejs.org/
   - Instalar la versión LTS recomendada

3. **uv (Gestor de paquetes Python)**
   ```powershell
   powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```

## Instalación y Ejecución

### Backend (FastAPI)

1. **Abrir PowerShell o CMD y navegar a la carpeta del backend:**
   ```powershell
   cd tp6\backend
   ```

2. **Instalar dependencias con uv:**
   ```powershell
   uv sync
   ```

3. **Ejecutar el servidor:**
   ```powershell
   uv run uvicorn main:app --reload
   ```
   
   O alternativamente:
   ```powershell
   python main.py
   ```

4. **Verificar que el servidor está corriendo:**
   - API: http://localhost:8000
   - Documentación interactiva: http://localhost:8000/docs
   - Productos: http://localhost:8000/productos
   - Imágenes: http://localhost:8000/imagenes/0001.png

### Frontend (Next.js)

1. **Abrir una nueva terminal PowerShell/CMD y navegar a la carpeta del frontend:**
   ```powershell
   cd tp6\frontend
   ```

2. **Instalar dependencias:**
   ```powershell
   npm install
   ```

3. **Ejecutar el servidor de desarrollo:**
   ```powershell
   npm run dev
   ```

4. **Abrir en el navegador:**
   - Frontend: http://localhost:3000

## Funcionalidades Implementadas

### Backend API

- ✅ **CRUD de Productos**: Listar, buscar, filtrar por categoría
- ✅ **Sistema de Autenticación**: Registro, login con JWT
- ✅ **Carrito de Compras**: Agregar, quitar, actualizar cantidades
- ✅ **Gestión de Pedidos**: Checkout, historial de compras
- ✅ **Base de Datos**: SQLite con SQLModel
- ✅ **Imágenes**: 20 productos con imágenes PNG
- ✅ **Documentación**: Swagger UI automático
- ✅ **CORS**: Configurado para frontend
- ✅ **Pruebas**: REST Client tests incluidos

### Frontend React

- ✅ **Catálogo de Productos**: Grid responsive con imágenes
- ✅ **Búsqueda y Filtros**: Por texto y categoría
- ✅ **Autenticación**: Login, registro, logout
- ✅ **Carrito de Compras**: Interfaz completa
- ✅ **Checkout**: Formulario de pedidos
- ✅ **Historial**: Ver compras anteriores
- ✅ **Responsive Design**: Tailwind CSS
- ✅ **TypeScript**: Tipado completo

## Testing

### Probar la API con REST Client

El archivo `backend/api-tests.http` contiene pruebas completas:

1. **Instalar la extensión REST Client en VSCode**
2. **Iniciar el servidor backend** (`uv run uvicorn main:app --reload`)
3. **Abrir `api-tests.http`** en VSCode
4. **Hacer clic en "Send Request"** sobre cada petición

### Flujo de Prueba Completo

El archivo incluye una **Sección 8** con flujo completo:
1. Registrar usuario
2. Iniciar sesión
3. Buscar productos
4. Agregar al carrito
5. Ver carrito
6. Finalizar compra
7. Ver historial

## Tecnologías Utilizadas

### Backend
- **FastAPI** - Framework web moderno
- **SQLModel** - ORM con Pydantic
- **SQLite** - Base de datos
- **JWT** - Autenticación
- **Uvicorn** - Servidor ASGI

### Frontend
- **Next.js 16** - Framework React
- **React 19** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first

## Estado del Proyecto

✅ **Proyecto Completado y Funcionando**

- Backend API completa con todas las funcionalidades
- Frontend React con interfaz completa
- Base de datos poblada con 20 productos
- Sistema de autenticación JWT funcional
- Carrito de compras y checkout implementado
- Documentación y pruebas incluidas

## Autor

**Luciano Llanos (61911)** - Trabajo Práctico 6 - Programación 4