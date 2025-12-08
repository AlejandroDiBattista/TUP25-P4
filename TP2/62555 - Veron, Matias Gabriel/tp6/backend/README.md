# Backend - API E-Commerce

## 🚀 Inicio Rápido

### Opción 1: Usando el script automático (Windows)
Simplemente haz doble clic en:
```
iniciar-backend.bat
```

### Opción 2: Manualmente

```bash
# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Ejecutar el servidor
python main.py
```

El servidor estará disponible en: **http://localhost:8000**

---

## 🗄️ Base de Datos

**La base de datos se crea automáticamente** al iniciar el servidor por primera vez.

### ¿Qué sucede al iniciar?

1. ✅ Se crean todas las tablas necesarias (usuarios, productos, carritos, compras)
2. ✅ Si la base de datos está vacía, se cargan 20 productos desde `app/data/productos.json`
3. ✅ El servidor queda listo para usar

**No es necesario ejecutar scripts adicionales de inicialización.**

### Ubicación de la BD
- Archivo: `app.db` (se crea automáticamente en el directorio backend)
- Tipo: SQLite

### Reiniciar la base de datos
Si necesitas reiniciar la base de datos desde cero:
1. Detener el servidor (Ctrl+C)
2. Eliminar el archivo `app.db`
3. Volver a iniciar el servidor → Se creará nueva BD con datos iniciales

---

## 📚 API Documentation

Una vez iniciado el servidor, puedes acceder a la documentación interactiva:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 🔐 Endpoints Principales

### Autenticación
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/me` - Obtener usuario actual

### Productos
- `GET /productos/` - Listar todos los productos
- `GET /productos/{id}` - Obtener un producto
- `GET /productos/categorias` - Listar categorías
- `GET /productos/?q=busqueda` - Buscar productos

### Carrito
- `GET /carrito/` - Ver carrito actual
- `POST /carrito/` - Agregar producto al carrito
- `PATCH /carrito/{id}` - Actualizar cantidad
- `DELETE /carrito/{id}` - Eliminar producto
- `POST /carrito/vaciar` - Vaciar carrito
- `POST /carrito/finalizar` - Finalizar compra

### Compras
- `GET /compras/` - Historial de compras
- `GET /compras/{id}` - Detalle de una compra

---

## 💾 Modelos de Datos

### Usuario
- id, email, nombre, apellido, telefono, direccion
- password (hasheado con bcrypt)

### Producto
- id, nombre, precio, descripcion, categoria, imagen, existencia

### Carrito
- id, usuario_id
- items (relación con CarritoItem)

### CarritoItem
- id, carrito_id, producto_id, cantidad

### Compra
- id, usuario_id, fecha, direccion_envio, tarjeta, total
- items (relación con CompraItem)

---

## ⚙️ Configuración

### Variables de Entorno (opcionales)
Puedes crear un archivo `.env` con:
```
DATABASE_URL=sqlite:///./app.db
SECRET_KEY=tu-clave-secreta-jwt
```

Si no se proporciona, se usan valores por defecto seguros.

---

## 🧪 Testing

El archivo `api-tests.http` contiene ejemplos de todas las peticiones HTTP para probar la API.

Puedes usarlo con extensiones como:
- REST Client (VS Code)
- Thunder Client
- O cualquier cliente HTTP (Postman, Insomnia, etc.)

---

## 📦 Dependencias

- **FastAPI**: Framework web moderno y rápido
- **SQLModel**: ORM basado en Pydantic y SQLAlchemy
- **Uvicorn**: Servidor ASGI
- **python-jose**: Manejo de JWT
- **passlib**: Hashing de contraseñas
- **python-multipart**: Soporte para formularios

---

## 🛠️ Desarrollo

### Estructura del proyecto
```
backend/
├── app/
│   ├── data/
│   │   └── productos.json      # Datos iniciales
│   ├── imagenes/               # Imágenes de productos
│   ├── models/                 # Modelos SQLModel
│   │   ├── usuarios.py
│   │   ├── productos.py
│   │   ├── carritos.py
│   │   └── compras.py
│   ├── routers/                # Endpoints
│   │   ├── auth.py
│   │   ├── productos.py
│   │   ├── carrito.py
│   │   └── compras.py
│   ├── auth.py                 # Lógica de autenticación
│   ├── crud.py                 # Operaciones CRUD
│   ├── database.py             # Configuración BD
│   ├── deps.py                 # Dependencias
│   └── main.py                 # App principal
├── main.py                     # Punto de entrada
├── requirements.txt            # Dependencias Python
└── app.db                      # Base de datos (auto-generada)
```

### Características Especiales

#### Gestión Optimista de Stock
- Al agregar productos al carrito, el stock se reduce inmediatamente
- Si se vacía el carrito sin comprar, el stock se restaura
- Al cambiar cantidades, solo se ajusta la diferencia

#### Cálculo de IVA Diferenciado
- 21% para productos generales
- 10% para categoría "Electrónica"

#### Envío Gratis
- Compras mayores a $100,000 ARS: envío gratis
- Compras menores: $5,000 ARS de envío

---

## 🐛 Troubleshooting

### El servidor no inicia
- Verificar que el puerto 8000 no esté en uso
- Asegurarse de tener Python 3.13+ instalado
- Verificar que todas las dependencias estén instaladas

### Error de base de datos
- Eliminar `app.db` y reiniciar el servidor
- Verificar permisos de escritura en el directorio

### Error de autenticación
- Verificar que el token JWT sea válido
- Comprobar que el usuario exista en la base de datos
