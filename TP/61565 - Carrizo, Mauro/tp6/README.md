# E-commerce - Proyecto TP6

Sitio de comercio electrónico desarrollado con React (Next.js) para el frontend y FastAPI para el backend.

## Estructura del Proyecto

```
TP6/
├── backend/          # API FastAPI
│   ├── routers/      # Endpoints de la API
│   ├── tests/        # Pruebas unitarias
│   └── ...
├── frontend/         # Aplicación Next.js
│   ├── app/          # Páginas y rutas
│   ├── components/   # Componentes UI
│   └── ...
└── productos.json    # Datos iniciales de productos
```

## Tecnologías

### Backend
- FastAPI
- SQLModel + SQLite
- JWT para autenticación
- Pytest para pruebas

### Frontend
- Next.js 14
- React 18
- Tailwind CSS
- Shadcn UI
- TypeScript

## Instalación y Configuración

### Backend

1. Navegar a la carpeta backend:
```bash
cd backend
```

2. Crear entorno virtual (recomendado):
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

4. Cargar productos iniciales:
```bash
python load_products.py
```

5. Ejecutar el servidor:
```bash
uvicorn main:app --reload
```

El servidor estará disponible en `http://localhost:8000`

### Frontend

1. Navegar a la carpeta frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar en modo desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Funcionalidades

### Autenticación
- Registro de usuario
- Inicio de sesión
- Cierre de sesión

### Productos
- Listado de productos
- Búsqueda por contenido
- Filtro por categoría
- Detalle de producto

### Carrito
- Agregar productos
- Quitar productos
- Ver contenido del carrito
- Cancelar compra

### Compras
- Finalizar compra (con dirección y tarjeta)
- Ver resumen de compras
- Ver detalle de compra

## Reglas de Negocio

- **IVA**: 21% del total (excepto productos electrónicos que tienen 10%)
- **Envío**: Gratis para compras superiores a $1000, de lo contrario $50
- Solo se pueden agregar productos con existencia disponible
- Los productos agotados se muestran como "Agotados"
- Los productos solo pueden eliminarse del carrito si no está finalizado

## Endpoints de la API

- `POST /api/registrar` - Registrar usuario
- `POST /api/iniciar-sesion` - Iniciar sesión
- `POST /api/cerrar-sesion` - Cerrar sesión
- `GET /api/productos` - Listar productos (con filtros opcionales)
- `GET /api/productos/{id}` - Obtener producto
- `POST /api/carrito` - Agregar producto al carrito
- `DELETE /api/carrito/{product_id}` - Quitar producto del carrito
- `GET /api/carrito` - Ver carrito
- `POST /api/carrito/finalizar` - Finalizar compra
- `POST /api/carrito/cancelar` - Cancelar compra
- `GET /api/compras` - Ver compras del usuario
- `GET /api/compras/{id}` - Ver detalle de compra

## Pruebas

Para ejecutar las pruebas del backend:

```bash
cd backend
pytest
```

## Notas

- La base de datos SQLite se crea automáticamente al iniciar el servidor
- El token JWT se almacena en localStorage del navegador
- Las imágenes de productos deben estar en la carpeta `/imagenes` (no implementado en esta versión)

