# 🛍️ E-Commerce TP6 - Proyecto Completo

Sistema de comercio electrónico desarrollado con **React (Next.js)** en el frontend y **FastAPI** en el backend.

## 📸 Características Principales

✅ **Autenticación segura** con JWT  
✅ **Catálogo de productos** con búsqueda y filtros  
✅ **Carrito de compras** con gestión de items  
✅ **Checkout** con cálculo de IVA y envío  
✅ **Historial de compras** para usuarios  
✅ **Base de datos** SQLite con ORM  
✅ **UI responsive** adaptable a todos los dispositivos  
✅ **Manejo robusto de errores**  

## 🚀 Inicio Rápido

### Requisitos
- Python 3.9+
- Node.js 18+
- npm o yarn

### Backend

```bash
# Navegar al backend
cd tp/61579\ -\ Gonzalo,\ Martín/tp6/backend

# Crear ambiente virtual
python -m venv venv

# Activar (Windows)
venv\Scripts\activate
# Activar (Mac/Linux)
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Backend en:** `http://localhost:8000`

### Frontend

```bash
# Navegar al frontend
cd tp/61579\ -\ Gonzalo,\ Martín/tp6/frontend

# Instalar dependencias
npm install

# Ejecutar servidor
npm run dev
```

**Frontend en:** `http://localhost:3000`

## 📖 Flujo de Uso

1. **Ir a** `http://localhost:3000`
2. **Registrarse** o iniciar sesión
3. **Explorar** productos con búsqueda y filtros
4. **Agregar** productos al carrito
5. **Revisar** carrito y ajustar cantidades
6. **Checkout** con dirección y pago
7. **Ver** historial de compras

## 📁 Estructura del Proyecto

```
tp6/
├── backend/
│   ├── main.py                 # API principal
│   ├── security.py             # Funciones JWT
│   ├── models/                 # Modelos SQLModel
│   ├── productos.json          # Datos iniciales
│   ├── imagenes/              # Imágenes de productos
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── components/         # Componentes React
│   │   ├── contexts/           # Context API
│   │   ├── services/           # Servicios API
│   │   ├── page.tsx            # Páginas (App Router)
│   │   └── ...
│   ├── package.json
│   └── tsconfig.json
│
└── Documentación
    ├── GUIA_COMPLETA.md        # Guía de uso detallada
    ├── CHECKLIST_FINAL.md      # Verificación de funcionalidades
    └── RESUMEN_MEJORAS.md      # Resumen técnico
```

## 🛠️ Tecnologías

### Backend
- **FastAPI**: Framework web moderno y rápido
- **SQLModel**: ORM combinando Pydantic + SQLAlchemy
- **SQLite**: Base de datos embebida
- **JWT**: Autenticación segura
- **bcrypt**: Hash de contraseñas

### Frontend
- **Next.js 16**: Framework React con SSR/SSG
- **React 19**: Biblioteca UI
- **TypeScript**: Tipado seguro
- **Tailwind CSS**: Estilos utilitarios
- **Context API**: Gestión de estado

## 🔐 Características de Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Tokens JWT con expiración
- ✅ CORS configurado
- ✅ Validación en servidor
- ✅ Rutas protegidas en frontend

## 💰 Cálculos Especiales

### IVA
- **Electrónica**: 10%
- **Otros productos**: 21%

### Envío
- **>= $1000**: Gratis
- **< $1000**: $50

## 📱 Responsive Design

- ✅ Mobile First
- ✅ Adaptable a tablets
- ✅ Optimizado para desktop
- ✅ Navbar colapsible

## 🧪 Testing

### API Manual
Usa el archivo `api-tests.http` en la carpeta backend con REST Client:
```
POST http://localhost:8000/registrar
POST http://localhost:8000/iniciar-sesion
GET http://localhost:8000/productos
POST http://localhost:8000/carrito
... y más
```

### Navegador
```
1. Abre http://localhost:3000
2. Regístrate con un usuario de prueba
3. Explora las funcionalidades
4. Verifica los cálculos
```

## 🚨 Troubleshooting

### Error de conexión
```
❌ "Cannot connect to API"
✅ Verifica que Backend esté en http://localhost:8000
```

### Token inválido
```
❌ "Token inválido o expirado"
✅ Limpia localStorage: F12 → Application → localStorage → Clear all
```

### Producto no encontrado
```
❌ "Producto no encontrado"
✅ Verifica que la BD tenga datos (se cargan automáticamente)
```

## 📚 Documentación Completa

- **[GUIA_COMPLETA.md](./GUIA_COMPLETA.md)** - Guía detallada de uso
- **[CHECKLIST_FINAL.md](./CHECKLIST_FINAL.md)** - Verificación de funcionalidades
- **[RESUMEN_MEJORAS.md](./RESUMEN_MEJORAS.md)** - Resumen técnico

## 📧 Características Destacadas

### Autenticación
- Registro con validación de contraseña
- Login seguro con JWT
- Logout con limpieza de token
- Protección automática de rutas

### Productos
- Búsqueda por texto (título y descripción)
- Filtros por categoría
- Vista de detalle con información completa
- Indicador de stock y productos agotados

### Carrito
- Agregar/quitar productos
- Modificar cantidades
- Cálculo automático de totales
- Sincronización con servidor

### Compras
- Formulario de dirección
- Datos de pago (datos de prueba)
- Cálculo de IVA inteligente
- Cálculo de envío automático
- Comprobante de compra

### Historial
- Ver todas las compras
- Detalles de cada compra
- Información de entrega
- Items comprados

## 🎯 Objetivos Cumplidos

- ✅ Funcionalidad completa de e-commerce
- ✅ Interfaz intuitiva y atractiva
- ✅ Cálculos precisos
- ✅ Manejo robusto de errores
- ✅ Código limpio y organizado
- ✅ Documentación completa
- ✅ Deployable en producción

## 🚀 Próximas Mejoras (Opcionales)

- Integración con Stripe para pagos reales
- Sistema de reviews de productos
- Wishlist de productos favoritos
- Dashboard admin
- Búsqueda full-text
- Recomendaciones basadas en historial
- Multi-idioma

## 👨‍💻 Autor

Desarrollo realizado para TP6 del curso de Programación.

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso educativo.

---

**¡Proyecto Completado! 🎉**

Para más información, consulta la documentación en las carpetas del proyecto.

