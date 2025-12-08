# 🚀 GUÍA COMPLETA - E-Commerce TP6

## ✨ Lo que se ha implementado

### ✅ Backend (FastAPI)
- **Autenticación**: Registro, Login, JWT Tokens
- **Productos**: Listado, búsqueda, filtros, detalle
- **Carrito**: Agregar, quitar, ver, cancelar
- **Compras**: Finalizar, historial, detalle
- **Cálculos**: IVA inteligente (21% general, 10% electrónica), Envío ($50 si < $1000)
- **Base de datos**: SQLite con SQLModel ORM

### ✅ Frontend (Next.js)
- **Autenticación**: Login, Registro con validación
- **Productos**: Catálogo, búsqueda, filtros por categoría
- **Detalle de Producto**: Vista completa con opción de agregar al carrito
- **Carrito**: Ver items, calcular totales, eliminar productos
- **Checkout**: Confirmación, cálculo de IVA y envío, finalización
- **Historial**: Ver compras anteriores y detalles

## 🛠️ Cómo Ejecutar

### Requisitos
- Python 3.9+
- Node.js 18+
- npm o yarn

### Paso 1: Backend

```bash
cd tp/61579\ -\ Gonzalo,\ Martín/tp6/backend

# Crear y activar ambiente virtual
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**El servidor correrá en**: `http://localhost:8000`

### Paso 2: Frontend

```bash
cd tp/61579\ -\ Gonzalo,\ Martín/tp6/frontend

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev
```

**La app correrá en**: `http://localhost:3000`

## 📝 Flujo de Uso

### 1. Registro
```
http://localhost:3000/registro
- Ingresa nombre, email y contraseña
- Serás redirigido automáticamente al catálogo
```

### 2. Catálogo de Productos
```
http://localhost:3000/productos
- Busca productos por texto
- Filtra por categoría
- Hace clic en un producto para ver detalles
```

### 3. Detalles del Producto
```
http://localhost:3000/producto/{id}
- Ve información completa del producto
- Elige cantidad
- Agrega al carrito
```

### 4. Carrito
```
http://localhost:3000/carrito
- Ve todos los items agregados
- Modifica cantidades si quieres
- Quita productos
- Procede al pago
```

### 5. Checkout
```
http://localhost:3000/checkout
- Ingresa dirección de entrega
- Ingresa datos de tarjeta (datos de prueba: 4111 1111 1111 1111)
- Confirma la compra
```

### 6. Compra Completada
```
http://localhost:3000/compra/{id}?exito=true
- Ve resumen de la compra realizada
- Puedes volver a mis compras o seguir comprando
```

### 7. Historial de Compras
```
http://localhost:3000/mis-compras
- Ve todas tus compras anteriores
- Hace clic en una para ver detalles
```

## 🧪 Testing (Backend)

### Pruebas Unitarias

```bash
# En la carpeta backend
pytest
```

### Pruebas Manuales con http-client

Hay un archivo `api-tests.http` en el backend para probar con REST Client:

```
# 1. Registrar usuario
POST http://localhost:8000/registrar
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}

# 2. Iniciar sesión
POST http://localhost:8000/iniciar-sesion
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password123"
}

# 3. Obtener productos
GET http://localhost:8000/productos

# 4. Obtener producto específico
GET http://localhost:8000/productos/1

# 5. Ver carrito (con token)
GET http://localhost:8000/carrito
Authorization: Bearer {token}

# ... más tests en api-tests.http
```

## 📊 Estructura de Carpetas - Final

```
backend/
├── main.py                 # API principal
├── security.py             # Funciones de seguridad
├── models/
│   ├── productos.py
│   ├── usuarios.py
│   └── compras.py
├── productos.json          # Datos iniciales
├── imagenes/              # Carpeta de imágenes
├── ecommerce.db          # Base de datos SQLite
├── venv/                 # Ambiente virtual
└── requirements.txt

frontend/
├── app/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   └── ProductoCard.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── CarritoContext.tsx
│   ├── services/
│   │   ├── auth.ts
│   │   ├── productos.ts
│   │   ├── carrito.ts
│   │   └── compras.ts
│   ├── tipos.ts
│   ├── layout.tsx
│   ├── page.tsx (inicio)
│   ├── login/
│   ├── registro/
│   ├── productos/
│   ├── producto/[id]/
│   ├── carrito/
│   ├── checkout/
│   ├── mis-compras/
│   └── compra/[id]/
├── package.json
└── tsconfig.json
```

## 🔑 Variables de Entorno

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📱 Capacidades de Respuesta

- Todos los componentes son **responsive** (mobile, tablet, desktop)
- Navbar se adapta en diferentes tamaños
- Grillas de productos se ajustan
- Tablas scrollean en mobile

## 🎨 Estilos

- **Tailwind CSS** para estilos
- Colores consistentes: Azul para primario, Verde para acciones positivas, Rojo para errores
- Emojis para iconografía rápida (sin dependencias extra)

## ⚙️ Cálculos Especiales

### IVA
```
- Electrónica: 10%
- Otros productos: 21%
- Se calcula por categoría del producto
```

### Envío
```
- Compra >= $1000: Gratis
- Compra < $1000: $50
```

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Tokens JWT para autenticación
- Protección de rutas en frontend
- Validación en backend

## 📦 Dependencias Principales

### Backend
- FastAPI
- SQLModel
- python-jose (JWT)
- passlib (hash)
- bcrypt

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

## 🚨 Troubleshooting

### Error: "Cannot connect to API"
- Verifica que Backend esté corriendo en `http://localhost:8000`
- Revisa que CORS esté configurado correctamente

### Error: "Token inválido"
- Intenta hacer logout y login nuevamente
- Limpia localStorage si es necesario

### Error: "Producto no encontrado"
- Verifica que la BD tenga productos (se cargan automáticamente)
- Revisa que el ID sea válido

## 📧 Contacto y Soporte

Si hay problemas o preguntas, revisa los logs en:
- **Backend**: Consola de uvicorn
- **Frontend**: Console del navegador (F12)

## 🎯 Funcionalidades Completadas

- ✅ Registro de usuarios
- ✅ Login/Logout
- ✅ Catálogo con búsqueda
- ✅ Filtros por categoría
- ✅ Detalle de producto
- ✅ Agregar al carrito
- ✅ Ver carrito
- ✅ Quitar del carrito
- ✅ Cancelar compra
- ✅ Finalizar compra
- ✅ Cálculo IVA inteligente
- ✅ Cálculo envío
- ✅ Historial de compras
- ✅ Detalle de compra
- ✅ Validación de stock
- ✅ Manejo de errores
- ✅ UI responsive

