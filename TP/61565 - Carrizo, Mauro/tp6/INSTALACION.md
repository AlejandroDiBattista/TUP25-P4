# Guía de Instalación - E-commerce TP6

## Requisitos Previos

- Python 3.8 o superior
- Node.js 18 o superior
- npm o yarn

## Pasos de Instalación

### 1. Backend (FastAPI)

```bash
# Navegar a la carpeta backend
cd backend

# Crear entorno virtual (recomendado)
python -m venv venv

# Activar entorno virtual
# En Linux/Mac:
source venv/bin/activate
# En Windows:
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Cargar productos iniciales
python load_products.py

# Ejecutar servidor
uvicorn main:app --reload
```

El servidor backend estará disponible en `http://localhost:8000`

### 2. Frontend (Next.js)

Abre una nueva terminal:

```bash
# Navegar a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación frontend estará disponible en `http://localhost:3000`

## Verificación

1. Abre `http://localhost:3000` en tu navegador
2. Deberías ver la página de login
3. Crea una cuenta nueva o inicia sesión
4. Explora los productos y realiza una compra de prueba

## Documentación de la API

Una vez que el backend esté corriendo, puedes acceder a:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Solución de Problemas

### Error: "No se puede conectar al backend"
- Verifica que el servidor backend esté corriendo en el puerto 8000
- Verifica que no haya errores en la terminal del backend

### Error: "Module not found"
- Asegúrate de haber instalado todas las dependencias
- En el backend: `pip install -r requirements.txt`
- En el frontend: `npm install`

### Error: "Base de datos no encontrada"
- La base de datos se crea automáticamente al iniciar el servidor
- Si hay problemas, elimina `ecommerce.db` y reinicia el servidor

## Pruebas

Para ejecutar las pruebas del backend:

```bash
cd backend
pytest
```

