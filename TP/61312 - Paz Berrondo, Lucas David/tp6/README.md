# 🛒 TP6 - Sistema de E-Commerce

**Estudiante:** Lucas David Paz Berrondo (Legajo: 61312)  
**Materia:** Programación 4  
**Fecha:** Noviembre 2025

Sistema de comercio electrónico full-stack desarrollado con FastAPI (backend) y Next.js (frontend).

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Ejecución](#-ejecución)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Testing](#-testing)
- [Funcionalidades](#-funcionalidades)

---

## ✨ Características

✅ **Autenticación Completa**
- Registro de usuarios con hash de contraseñas (bcrypt)
- Inicio de sesión con JWT tokens
- Cierre de sesión
- Protección de rutas con autenticación

✅ **Gestión de Productos**
- Catálogo de 20 productos con imágenes
- Búsqueda por nombre/descripción
- Filtrado por categoría
- Vista detallada de productos

✅ **Carrito de Compras**
- Agregar productos al carrito
- Modificar cantidades
- Eliminar productos
- Vaciar carrito
- Validación de stock en tiempo real

✅ **Finalización de Compra**
- Cálculo automático de IVA (21%)
- Cálculo de envío ($500 o gratis >$5000)
- Actualización de stock
- Registro de compra con todos los detalles

✅ **Historial de Compras**
- Listado de compras realizadas
- Vista detallada de cada compra
- Información de productos, precios y totales

---

## 🛠 Tecnologías Utilizadas

### Backend
- **FastAPI** 0.115.6 - Framework web moderno y rápido
- **SQLModel** 0.0.22 - ORM basado en SQLAlchemy y Pydantic
- **SQLite** - Base de datos ligera
- **Python-JOSE** 3.3.0 - Manejo de JWT tokens
- **Bcrypt** 4.0.1 - Hash de contraseñas
- **Uvicorn** 0.34.0 - Servidor ASGI

### Frontend
- **Next.js** 16.0.1 - Framework de React
- **React** 19.2.0 - Biblioteca de UI
- **TypeScript** 5.x - Tipado estático
- **Tailwind CSS** 4.x - Framework de CSS
- **ESLint** - Linter de código

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

1. **Python 3.13 o superior**
   - Descargar desde: https://www.python.org/downloads/
   - Durante la instalación, marcar "Add Python to PATH"

2. **Node.js 20 o superior**
   - Descargar desde: https://nodejs.org/
   - Instalar la versión LTS recomendada

3. **uv (Gestor de paquetes Python)**
   ```powershell
   powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```

---

## 📥 Instalación

### 1. Clonar el Repositorio

```powershell
git clone <url-del-repositorio>
cd tp6
```

### 2. Configurar Backend

```powershell
# Navegar a la carpeta del backend
cd backend

# Instalar dependencias con uv
uv sync

# Esto creará un entorno virtual en .venv e instalará todas las dependencias
```

### 3. Configurar Frontend

```powershell
# Abrir una nueva terminal
# Navegar a la carpeta del frontend
cd frontend

# Instalar dependencias
npm install
```

---

## 🚀 Ejecución

### Iniciar el Backend

```powershell
# Desde la carpeta tp6/backend
cd backend

# Opción 1: Usando uv (Recomendado)
uv run uvicorn main:app --reload

# Opción 2: Usando el entorno virtual directamente
.venv\Scripts\uvicorn.exe main:app --reload
```

**El backend estará disponible en:**
- API: http://localhost:8000
- Documentación Swagger: http://localhost:8000/docs
- Productos: http://localhost:8000/productos

### Iniciar el Frontend

```powershell
# Abrir una nueva terminal
# Desde la carpeta tp6/frontend
cd frontend

# Iniciar servidor de desarrollo
npm run dev
```

**El frontend estará disponible en:**
- Aplicación: http://localhost:3000

---

## 📁 Estructura del Proyecto

```
tp6/
├── backend/
│   ├── main.py                    # Punto de entrada de la API
│   ├── auth.py                    # Funciones de autenticación (JWT, bcrypt)
│   ├── database.py                # Configuración de SQLite
│   ├── dependencies.py            # Dependencias de FastAPI
│   ├── models/
│   │   ├── __init__.py
│   │   └── productos.py           # Modelos SQLModel (6 tablas)
│   ├── productos.json             # Datos iniciales (20 productos)
│   ├── imagenes/                  # Imágenes de productos
│   ├── api-tests.http             # Pruebas REST Client
│   ├── test_*.py                  # Tests unitarios (pytest)
│   ├── pyproject.toml             # Dependencias Python
│   └── ecommerce.db              # Base de datos SQLite (generada)
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Página principal - Catálogo
│   │   ├── layout.tsx            # Layout general
│   │   ├── globals.css           # Estilos globales
│   │   ├── auth/
│   │   │   └── page.tsx          # Login/Registro
│   │   ├── carrito/
│   │   │   └── page.tsx          # Carrito de compras
│   │   ├── compras/
│   │   │   └── page.tsx          # Historial de compras
│   │   ├── components/
│   │   │   └── ProductoCard.tsx  # Card de producto
│   │   ├── services/
│   │   │   ├── auth.ts           # Servicio de autenticación
│   │   │   └── productos.ts      # Servicio de productos
│   │   └── types.ts              # Tipos TypeScript
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── GUIAPROYECTO.MD               # Especificaciones del proyecto
├── como-probar-backend.md        # Guía de pruebas del backend
├── como-configurar-sistema.md    # Guía de configuración
├── PLAN-DESARROLLO.md            # Plan de desarrollo y commits
└── README.md                     # Este archivo
```

---

## 🔗 Endpoints de la API

### Autenticación

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/registrar` | Registrar nuevo usuario | No |
| POST | `/iniciar-sesion` | Iniciar sesión (obtener JWT) | No |
| POST | `/cerrar-sesion` | Cerrar sesión | Sí |

### Productos

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/productos` | Listar productos (con filtros) | No |
| GET | `/productos/{id}` | Obtener detalle de producto | No |

### Carrito

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/carrito` | Ver carrito actual | Sí |
| POST | `/carrito` | Agregar producto al carrito | Sí |
| POST | `/carrito/agregar` | Alias para agregar producto | Sí |
| DELETE | `/carrito/{producto_id}` | Quitar producto | Sí |
| DELETE | `/carrito/quitar/{producto_id}` | Alias para quitar producto | Sí |
| DELETE | `/carrito/vaciar` | Vaciar carrito completo | Sí |
| POST | `/carrito/cancelar` | Cancelar carrito | Sí |
| POST | `/carrito/finalizar` | Finalizar compra | Sí |

### Compras

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/compras` | Listar compras del usuario | Sí |
| GET | `/compras/historial` | Alias para listar compras | Sí |
| GET | `/compras/{id}` | Ver detalle de compra | Sí |

---

## 🧪 Testing

### Probar con REST Client (VSCode)

1. **Instalar extensión REST Client** en VSCode
2. **Abrir** `backend/api-tests.http`
3. **Iniciar** el servidor backend
4. **Ejecutar** las peticiones haciendo clic en "Send Request"

El archivo incluye:
- ✅ Pruebas de todos los endpoints
- ✅ Flujo completo de usuario
- ✅ Casos de error
- ✅ 8 secciones con 30+ pruebas

### Ejecutar Tests Unitarios

```powershell
cd backend
uv run pytest
```

Tests incluidos:
- `test_auth_endpoints.py` - Autenticación (4 tests)
- `test_productos.py` - Productos (6 tests)
- `test_carrito.py` - Carrito (11 tests)
- `test_finalizar_compra.py` - Checkout (8 tests)
- `test_compras.py` - Historial (7 tests)

**Total: 36 tests unitarios**

---

## 🎯 Funcionalidades

### Reglas de Negocio Implementadas

✅ **Validación de Stock**
- Solo se permite agregar productos con existencia disponible
- El stock se actualiza al finalizar la compra
- Productos sin stock se muestran como "Agotados"

✅ **Cálculo de IVA**
- IVA del 21% sobre el subtotal de la compra

✅ **Cálculo de Envío**
- Envío GRATIS para compras mayores a $5000
- Envío de $500 para compras menores

✅ **Autenticación y Seguridad**
- Contraseñas hasheadas con bcrypt
- Tokens JWT con expiración de 30 minutos
- Endpoints protegidos requieren autenticación
- Validación de propiedad de recursos

✅ **Gestión de Carrito**
- Un carrito activo por usuario
- Los productos se pueden modificar antes de finalizar
- El carrito se vacía automáticamente al finalizar la compra
- Validación de stock al agregar productos

---

## 📸 Capturas de Pantalla

### 1. Catálogo de Productos
![Catálogo](docs/screenshots/catalogo.png)

### 2. Login/Registro
![Auth](docs/screenshots/auth.png)

### 3. Carrito de Compras
![Carrito](docs/screenshots/carrito.png)

### 4. Historial de Compras
![Historial](docs/screenshots/historial.png)

---

## 👨‍💻 Desarrollo

### Comandos Útiles

```powershell
# Backend - Ejecutar servidor
cd backend
uv run uvicorn main:app --reload

# Backend - Ejecutar tests
cd backend
uv run pytest

# Frontend - Ejecutar servidor
cd frontend
npm run dev

# Frontend - Compilar para producción
cd frontend
npm run build

# Frontend - Ejecutar linter
cd frontend
npm run lint
```

### Git - Commits Realizados

El proyecto cuenta con **10 commits** descriptivos:

1. ✅ COMMIT 1: Configurar modelos de base de datos
2. ✅ COMMIT 2: Implementar sistema de autenticación (JWT + hashing)
3. ✅ COMMIT 3: Endpoints de autenticación
4. ✅ COMMIT 4: Endpoints de productos (detalle + filtros)
5. ✅ COMMIT 5: Endpoints de carrito
6. ✅ COMMIT 6: Endpoint de finalizar compra
7. ✅ COMMIT 8: Endpoints de historial de compras
8. ✅ COMMIT 10: Implementar frontend completo
9. ✅ docs: Actualizar estado del proyecto al 100%
10. ✅ fix: Agregar endpoints alias y documentación final

---

## 📝 Notas

- La base de datos SQLite (`ecommerce.db`) se crea automáticamente al iniciar el backend
- Los productos iniciales se cargan desde `productos.json`
- Las imágenes están en la carpeta `imagenes/`
- El token JWT se almacena en localStorage del navegador
- Los tests crean una base de datos temporal para no afectar los datos

---

## 📄 Licencia

Este proyecto fue desarrollado como parte del curso de Programación 4.

---

## 🤝 Contacto

**Lucas David Paz Berrondo**  
Legajo: 61312  
Universidad Tecnológica Nacional - FRT
