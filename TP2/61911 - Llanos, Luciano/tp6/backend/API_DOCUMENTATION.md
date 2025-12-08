# 🛒 API E-Commerce - Documentación Completa

## 📋 Descripción General

Sistema completo de e-commerce desarrollado con **FastAPI** que incluye:
- 🔐 Autenticación JWT
- 📦 Gestión de productos
- 🛒 Carrito de compras
- 💳 Proceso de checkout
- 📋 Gestión de pedidos
- 👑 Panel administrativo

## 🚀 Inicio Rápido

### Prerrequisitos
```bash
Python 3.9+
pip install -r requirements.txt
```

### Ejecutar el Servidor
```bash
# Método 1: Directo
python main.py

# Método 2: Con uvicorn
uvicorn main:app --reload --port 8002
```

### Ejecutar Pruebas
```bash
# Pruebas automatizadas
python run_tests.py

# Con cobertura
python run_tests.py --coverage
```

## 📡 Endpoints de la API

### 🏠 **Básicos**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/` | Mensaje de bienvenida |
| `GET` | `/health` | Estado del servidor |
| `GET` | `/docs` | Documentación Swagger |

### 📦 **Productos**
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/productos` | Listar todos los productos | ❌ |
| `GET` | `/productos/{id}` | Obtener producto por ID | ❌ |
| `GET` | `/categorias` | Listar categorías | ❌ |

### 🔐 **Autenticación**
| Método | Endpoint | Descripción | Request |
|--------|----------|-------------|---------|
| `POST` | `/registrar` | Registrar usuario | `UsuarioRegistro` |
| `POST` | `/iniciar-sesion` | Login | `UsuarioLogin` |
| `GET` | `/perfil` | Obtener perfil | Header: Bearer Token |

### 🛒 **Carrito de Compras**
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/carrito` | Obtener carrito | ✅ |
| `POST` | `/carrito/agregar` | Agregar producto | ✅ |
| `PUT` | `/carrito/item/{id}` | Actualizar cantidad | ✅ |
| `DELETE` | `/carrito/item/{id}` | Eliminar item | ✅ |
| `DELETE` | `/carrito/vaciar` | Vaciar carrito | ✅ |
| `GET` | `/carrito/resumen` | Resumen de totales | ✅ |

### 💳 **Checkout y Pedidos**
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/checkout/preview` | Preview de costos | ✅ |
| `POST` | `/checkout` | Procesar pedido | ✅ |
| `GET` | `/pedidos` | Historial de pedidos | ✅ |
| `GET` | `/pedidos/{id}` | Detalles de pedido | ✅ |
| `GET` | `/pedidos/numero/{numero}` | Buscar por número | ✅ |
| `PUT` | `/pedidos/{id}/cancelar` | Cancelar pedido | ✅ |

### 👑 **Administrativos**
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `PUT` | `/admin/pedidos/{id}/estado` | Actualizar estado | ⚠️ |
| `GET` | `/admin/pedidos` | Todos los pedidos | ⚠️ |

## 🔧 Modelos de Datos

### Usuario
```json
{
  "nombre": "string",
  "apellido": "string", 
  "email": "string",
  "password": "string",
  "telefono": "string (opcional)",
  "direccion": "string (opcional)"
}
```

### Producto
```json
{
  "id": "integer",
  "titulo": "string",
  "precio": "float",
  "descripcion": "string",
  "categoria": "string",
  "valoracion": "float",
  "existencia": "integer",
  "imagen": "string"
}
```

### Carrito Item
```json
{
  "producto_id": "integer",
  "cantidad": "integer (1-10)"
}
```

### Pedido Request
```json
{
  "direccion_entrega": {
    "direccion": "string",
    "ciudad": "string", 
    "codigo_postal": "string",
    "telefono": "string"
  },
  "info_pago": {
    "metodo_pago": "enum",
    "numero_tarjeta": "string (opcional)",
    "nombre_titular": "string (opcional)"
  },
  "notas": "string (opcional)"
}
```

## 🔄 Estados de Pedido

| Estado | Descripción | Transiciones |
|--------|-------------|--------------|
| `pendiente` | Recién creado | → confirmado, cancelado |
| `confirmado` | Pago procesado | → preparando, cancelado |
| `preparando` | En preparación | → enviado |
| `enviado` | En tránsito | → entregado |
| `entregado` | Completado | ❌ |
| `cancelado` | Cancelado | ❌ |

## 💰 Sistema de Costos

### Cálculo de Envío
- 🆓 **Gratis**: Compras > $50,000
- 💰 **Reducido** ($5,000): Compras > $25,000
- 📦 **Estándar** ($8,500): Compras menores

### Impuestos
- **IVA**: 21% sobre subtotal

### Descuentos
- **Por volumen**: 5% para compras > $100,000

## 🛡️ Autenticación

### JWT Tokens
- **Algoritmo**: HS256
- **Expiración**: 30 minutos
- **Header**: `Authorization: Bearer <token>`

### Registro
```bash
POST /registrar
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Perez",
  "email": "juan@example.com", 
  "password": "password123"
}
```

### Login
```bash
POST /iniciar-sesion
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password123" 
}

# Response
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

## 🔄 Flujo Completo de Compra

### 1. Preparación
```bash
# Registrar usuario
POST /registrar

# Iniciar sesión
POST /iniciar-sesion
```

### 2. Explorar Productos
```bash
# Listar productos
GET /productos

# Ver detalles
GET /productos/1
```

### 3. Gestión del Carrito
```bash
# Agregar productos
POST /carrito/agregar
{
  "producto_id": 1,
  "cantidad": 2
}

# Ver carrito
GET /carrito
```

### 4. Checkout
```bash
# Preview de costos
GET /checkout/preview

# Procesar pedido
POST /checkout
{
  "direccion_entrega": {...},
  "info_pago": {...}
}
```

### 5. Seguimiento
```bash
# Ver pedidos
GET /pedidos

# Detalles específicos  
GET /pedidos/1
```

## 📊 Base de Datos

### Tablas Principales
- `usuario` - Usuarios registrados
- `producto` - Catálogo de productos  
- `carrito` - Carritos de usuarios
- `carritoitem` - Items en carritos
- `pedido` - Órdenes procesadas
- `pedidoitem` - Items de órdenes

### Relaciones
- Usuario 1:1 Carrito
- Carrito 1:N CarritoItem
- Usuario 1:N Pedido  
- Pedido 1:N PedidoItem
- Producto 1:N CarritoItem/PedidoItem

## 🧪 Testing

### Ejecutar Pruebas
```bash
# Todas las pruebas
python run_tests.py

# Solo una clase
pytest test_api.py::TestCarrito -v

# Con output detallado
pytest test_api.py -v -s
```

### Cobertura de Pruebas
- ✅ Endpoints básicos
- ✅ Autenticación completa
- ✅ Gestión de carrito
- ✅ Proceso de checkout
- ✅ Validaciones y errores
- ✅ Endpoints administrativos

## 🚀 Despliegue

### Desarrollo Local
```bash
python main.py
# Servidor en http://127.0.0.1:8002
```

### Producción
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Variables de Entorno
```env
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./ecommerce.db
```

## 📁 Estructura del Proyecto

```
backend/
├── main.py                 # Aplicación principal
├── database.py            # Configuración BD
├── auth.py                # Autenticación JWT
├── carrito_helpers.py     # Helpers carrito
├── pedidos_helpers.py     # Helpers pedidos
├── models/
│   ├── __init__.py
│   ├── productos.py       # Modelos productos
│   ├── usuarios.py        # Modelos usuarios
│   ├── carrito.py         # Modelos carrito
│   └── pedidos.py         # Modelos pedidos
├── test_api.py            # Pruebas automatizadas
├── run_tests.py           # Script de pruebas
├── pruebas.rest           # Casos de prueba REST
├── CHECKOUT_PEDIDOS.md    # Doc checkout
├── productos.json         # Datos iniciales
├── ecommerce.db          # Base de datos SQLite
└── requirements.txt       # Dependencias
```

## 🔧 Troubleshooting

### Problemas Comunes

**Error 401 - No autorizado**
```bash
# Verificar token válido
# Regenerar token con /iniciar-sesion
```

**Error 400 - Stock insuficiente**
```bash
# Verificar disponibilidad con GET /productos/{id}
# Reducir cantidad en carrito
```

**Error 404 - Producto no encontrado**
```bash
# Verificar ID existe con GET /productos
```

## 📞 Soporte

- 📧 **Email**: soporte@ecommerce-api.com
- 📚 **Documentación**: http://localhost:8002/docs  
- 🐛 **Bugs**: GitHub Issues
- 💬 **Chat**: Discord/Slack

---

**Desarrollado con ❤️ usando FastAPI, SQLModel y Python**