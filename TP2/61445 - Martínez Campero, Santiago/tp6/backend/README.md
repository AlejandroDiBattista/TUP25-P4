# TP6 Shop - Backend API

API RESTful desarrollada con FastAPI y SQLite para el e-commerce TP6.

## Requisitos Previos

- Python 3.13+
- uv (gestor de paquetes)

## Instalación

```bash
# Instalar dependencias
uv sync

# Iniciar servidor de desarrollo
uv run uvicorn main:app --reload
```

## Estructura de Carpetas

```
backend/
├── main.py              # Punto de entrada de la API
├── config.py            # Configuración y constantes
├── utils.py             # Funciones de utilidad (JWT, passwords)
├── models/
│   ├── __init__.py
│   ├── productos.py     # Modelo Producto
│   ├── usuarios.py      # Modelo Usuario
│   ├── carrito.py       # Modelos Carrito e ItemCarrito
│   └── compras.py       # Modelos Compra e ItemCompra
├── productos.json       # Datos iniciales
├── imagenes/            # Imágenes de productos
├── pyproject.toml       # Dependencias
└── README.md
```

## Endpoints Principales

### Productos
- `GET /productos` - Listar todos los productos
- `GET /productos/{id}` - Obtener detalle de un producto

### Autenticación
- `POST /registrar` - Registrar nuevo usuario
- `POST /iniciar-sesion` - Login
- `POST /cerrar-sesion` - Logout

### Carrito
- `POST /carrito` - Agregar producto al carrito
- `GET /carrito` - Ver contenido del carrito
- `DELETE /carrito/{producto_id}` - Quitar producto del carrito
- `POST /carrito/cancelar` - Cancelar compra

### Compras
- `POST /carrito/finalizar` - Finalizar compra
- `GET /compras` - Ver historial de compras
- `GET /compras/{id}` - Ver detalle de compra

## Documentación Interactiva

Acceder a `http://localhost:8000/docs` para ver la documentación Swagger.

## Variables de Entorno

Ver archivo `.env` para configuración disponible.

## Base de Datos

SQLite crea automáticamente la base de datos `database.db` en el primer run.

Para inspeccionar la BD, usar la extensión SQLite de VSCode.
