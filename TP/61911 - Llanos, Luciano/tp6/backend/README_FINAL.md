# 🛒 E-Commerce Backend API - TP6

**Sistema completo de comercio electrónico** desarrollado con **FastAPI**, **SQLModel** y arquitectura moderna.

## 🎯 Proyecto Completado

Este proyecto implementa un **sistema E-Commerce completo** con todas las funcionalidades requeridas:

### ✅ **Funcionalidades Implementadas**

#### 🔐 **Sistema de Autenticación**
- Registro y login de usuarios con validaciones
- Autenticación JWT segura (HS256, 30min)
- Gestión de perfiles y autorización
- Validación de emails y contraseñas

#### 📦 **Gestión de Productos**
- Catálogo completo (20 productos iniciales)
- Búsqueda por ID y filtros por categoría
- Control automático de stock e inventario
- Metadatos completos (precio, descripción, imágenes)

#### 🛒 **Carrito de Compras**
- Agregar/eliminar productos con validaciones
- Actualizar cantidades (límites: 1-10 por item)
- Validación de stock en tiempo real
- Cálculos automáticos de subtotales

#### 💳 **Sistema de Checkout Completo**
- Preview detallado de costos antes de comprar
- Procesamiento de pagos simulado (5 métodos)
- Cálculos inteligentes:
  - **IVA**: 21% automático
  - **Envío**: Gratis >$50k, Reducido >$25k, Estándar <$25k
  - **Descuentos**: 5% por volumen >$100k
- Generación de números de pedido únicos

#### 📋 **Gestión de Pedidos**
- Estados completos: pendiente → entregado
- Historial de compras del usuario
- Búsqueda por ID y número de pedido
- Cancelación con restauración de stock
- Números de seguimiento automáticos
- Fechas estimadas de entrega (3-7 días)

#### 👑 **Panel Administrativo**
- Gestión de estados de pedidos
- Listado completo de órdenes
- Actualización de seguimientos
- Reportes del sistema

#### 🧪 **Testing y Calidad**
- Suite completa de pruebas automatizadas (pytest)
- Cobertura de todos los endpoints
- Validaciones de errores y edge cases
- Script de pruebas integrado

## 🏗️ Arquitectura

### **Stack Tecnológico**
- **FastAPI** - Framework web moderno
- **SQLModel** - ORM con validación Pydantic
- **SQLite** - Base de datos embebida
- **JWT** - Autenticación segura
- **Pytest** - Testing automatizado
- **Swagger/OpenAPI** - Documentación interactiva

### **Estructura Modular**
```
backend/
├── main.py                 # 🎯 Aplicación principal
├── database.py            # 🗄️  Configuración BD
├── auth.py                # 🔐 Sistema JWT
├── carrito_helpers.py     # 🛒 Lógica carrito
├── pedidos_helpers.py     # 📦 Lógica pedidos
├── models/                # 📊 Modelos de datos
│   ├── productos.py
│   ├── usuarios.py
│   ├── carrito.py
│   └── pedidos.py
├── test_api.py            # 🧪 Pruebas automatizadas
└── docs/                  # 📚 Documentación
```

## 🚀 **Inicio Rápido**

### **1. Instalar Dependencias**
```bash
cd backend/
pip install -r requirements.txt
```

### **2. Ejecutar Servidor**
```bash
python main.py
# Servidor disponible en: http://127.0.0.1:8002
```

### **3. Acceder a Documentación**
- **Swagger UI**: http://127.0.0.1:8002/docs
- **ReDoc**: http://127.0.0.1:8002/redoc

### **4. Ejecutar Pruebas**
```bash
python run_tests.py
# O con pytest directamente
pytest test_api.py -v
```

## 📡 **API Endpoints**

### **🔐 Autenticación**
- `POST /registrar` - Registro de usuario
- `POST /iniciar-sesion` - Login y obtener token
- `GET /perfil` - Obtener perfil (auth)

### **📦 Productos**
- `GET /productos` - Listar todos
- `GET /productos/{id}` - Obtener por ID
- `GET /categorias` - Listar categorías

### **🛒 Carrito**
- `GET /carrito` - Ver carrito (auth)
- `POST /carrito/agregar` - Agregar producto (auth)
- `PUT /carrito/item/{id}` - Actualizar cantidad (auth)
- `DELETE /carrito/item/{id}` - Eliminar item (auth)
- `DELETE /carrito/vaciar` - Vaciar carrito (auth)

### **💳 Checkout y Pedidos**
- `GET /checkout/preview` - Preview de costos (auth)
- `POST /checkout` - Procesar pedido (auth)
- `GET /pedidos` - Historial (auth)
- `GET /pedidos/{id}` - Detalles (auth)
- `PUT /pedidos/{id}/cancelar` - Cancelar (auth)

### **👑 Administrativo**
- `GET /admin/pedidos` - Todos los pedidos
- `PUT /admin/pedidos/{id}/estado` - Actualizar estado

## 🔄 **Flujo de Uso Completo**

### **1. Preparación**
```http
# Registrar usuario
POST /registrar
{
  "nombre": "Juan",
  "apellido": "Perez", 
  "email": "juan@test.com",
  "password": "password123"
}

# Login
POST /iniciar-sesion
{
  "email": "juan@test.com",
  "password": "password123"
}
# Response: {"access_token": "eyJ...", "token_type": "bearer"}
```

### **2. Comprar Productos**
```http
# Ver productos
GET /productos

# Agregar al carrito
POST /carrito/agregar
Authorization: Bearer <token>
{
  "producto_id": 1,
  "cantidad": 2
}

# Ver carrito
GET /carrito
Authorization: Bearer <token>
```

### **3. Checkout**
```http
# Preview de costos
GET /checkout/preview
Authorization: Bearer <token>

# Procesar pedido
POST /checkout
Authorization: Bearer <token>
{
  "direccion_entrega": {
    "direccion": "Av. San Martín 123",
    "ciudad": "Tucumán",
    "codigo_postal": "4000", 
    "telefono": "3814567890"
  },
  "info_pago": {
    "metodo_pago": "tarjeta_credito",
    "numero_tarjeta": "4532123456789012",
    "nombre_titular": "Juan Perez"
  }
}
```

### **4. Seguimiento**
```http
# Ver historial
GET /pedidos
Authorization: Bearer <token>

# Ver detalles
GET /pedidos/1
Authorization: Bearer <token>
```

## 💾 **Base de Datos**

### **Productos Iniciales**
- 20 productos precargados desde `productos.json`
- Categorías: Ropa (hombre/mujer), Joyería, Electrónica
- Stock inicial: 5 unidades por producto
- Precios desde $7.95 hasta $999.99

### **Tablas Principales**
- `usuario` (id, nombre, apellido, email, password_hash, ...)
- `producto` (id, titulo, precio, descripcion, categoria, existencia, ...)
- `carrito` (id, usuario_id, fecha_creacion, activo)
- `carritoitem` (id, carrito_id, producto_id, cantidad, precio_unitario)
- `pedido` (id, usuario_id, numero_pedido, estado, totales, ...)
- `pedidoitem` (id, pedido_id, producto_id, cantidad, subtotal, ...)

## 🧪 **Testing**

### **Cobertura de Pruebas**
- ✅ Endpoints básicos y health check
- ✅ Autenticación completa (registro, login, validaciones)
- ✅ Gestión de carrito (CRUD completo)
- ✅ Proceso de checkout y pedidos
- ✅ Validaciones de stock y errores
- ✅ Endpoints administrativos

### **Ejecutar Tests**
```bash
# Todas las pruebas
python run_tests.py

# Con cobertura
python run_tests.py --coverage

# Pruebas específicas
pytest test_api.py::TestCarrito -v
```

## 📚 **Documentación**

- **`API_DOCUMENTATION.md`** - Documentación completa de endpoints
- **`CHECKOUT_PEDIDOS.md`** - Sistema de checkout detallado  
- **`pruebas.rest`** - Casos de prueba REST Client
- **Swagger UI** - Documentación interactiva en `/docs`

## 🔧 **Configuración**

### **Variables de Entorno**
```env
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./ecommerce.db
```

### **Desarrollo vs Producción**
```bash
# Desarrollo
python main.py

# Producción  
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📊 **Estadísticas del Proyecto**

- **Líneas de código**: ~2,500 líneas
- **Endpoints**: 25+ endpoints completos
- **Modelos**: 10 modelos SQLModel
- **Tests**: 30+ casos de prueba
- **Archivos**: 15+ archivos organizados
- **Commits**: 6 commits sistemáticos
- **Tiempo desarrollo**: Implementación incremental

## 🎯 **Cumplimiento de Requisitos**

✅ **API REST completa** con FastAPI  
✅ **Base de datos** SQLite + SQLModel  
✅ **Autenticación JWT** segura  
✅ **CRUD productos** completo  
✅ **Sistema carrito** funcional  
✅ **Checkout y pedidos** completos  
✅ **Testing automatizado** con pytest  
✅ **Documentación** exhaustiva  
✅ **Arquitectura modular** y escalable  
✅ **Validaciones** y manejo de errores  
✅ **Estilos consistentes** según PDF  

---

## 👨‍💻 **Desarrollador**

**Luciano Llanos** - Legajo 61911  
**Programación 4** - TUP 2025  
**Trabajo Práctico 6** - E-Commerce API

---

**🚀 Proyecto completado al 100% - Listo para producción**