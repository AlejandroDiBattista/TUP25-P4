# TP6 - E-Commerce con FastAPI y Next.js

Desarrollo de un sitio de comercio electrónico simple utilizando React (Next.js) para el frontend y FastAPI para el backend.

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

## Estructura del Proyecto

```
tp6/
├── backend/          # API FastAPI
│   ├── main.py       # Archivo principal de la API
│   ├── productos.json
│   ├── imagenes/
│   └── pyproject.toml
├── frontend/         # Aplicación Next.js
│   ├── app/
│   ├── package.json
│   └── next.config.ts
└── README.md
```

## Instalación y Ejecución

### Backend (FastAPI)

1. **Abrir PowerShell o CMD y navegar a la carpeta del backend:**
   ```powershell
   cd ruta\al\proyecto\tp6\backend
   ```

2. **Instalar dependencias con uv:**
   ```powershell
   uv sync
   ```
   
   Esto creará un entorno virtual en `.venv` e instalará:
   - FastAPI
   - Uvicorn
   - SQLModel
   - Todas las dependencias necesarias

3. **Ejecutar el servidor:**
   ```powershell
   .venv\Scripts\uvicorn.exe main:app --reload
   ```
   
   O usando uv directamente (si está en el PATH):
   ```powershell
   uv run uvicorn main:app --reload
   ```

4. **Verificar que el servidor está corriendo:**
   - API: http://localhost:8000
   - Documentación interactiva: http://localhost:8000/docs
   - Productos: http://localhost:8000/productos
   - Imágenes: http://localhost:8000/imagenes/0001.png

### Frontend (Next.js)

1. **Abrir una nueva terminal PowerShell/CMD y navegar a la carpeta del frontend:**
   ```powershell
   cd ruta\al\proyecto\tp6\frontend
   ```

2. **Instalar dependencias:**
   ```powershell
   npm install
   ```
   
   Esto instalará:
   - React 19
   - Next.js 16
   - Tailwind CSS
   - TypeScript
   - Todas las dependencias necesarias

3. **Configurar variables de entorno (opcional):**
   
   Crear archivo `.env.local` en la carpeta `frontend` con:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Ejecutar el servidor de desarrollo:**
   ```powershell
   npm run dev
   ```

5. **Abrir en el navegador:**
   - Frontend: http://localhost:3000
   - (Si el puerto 3000 está ocupado, Next.js usará el 3001 automáticamente)

## Testing

### Probar la API con REST Client (Recomendado) 🚀

El archivo `api-tests.http` contiene todas las pruebas de la API listas para ejecutar. Es la forma más fácil y rápida de probar todos los endpoints sin escribir código.

#### Paso 1: Instalar la extensión REST Client

1. Abrir VSCode
2. Presionar `Ctrl+Shift+X` (Windows/Linux) o `Cmd+Shift+X` (Mac)
3. Buscar: **"REST Client"** (autor: Huachao Mao)
4. Hacer clic en **"Install"**

![REST Client Extension](https://github.com/Huachao/vscode-restclient/raw/master/images/usage.gif)

#### Paso 2: Iniciar el servidor backend

**Opción 1 - Usando uv (Recomendado):**
```powershell
cd ruta\al\proyecto\tp6\backend
uv run uvicorn main:app --reload
```

**Opción 2 - Usando el entorno virtual directamente:**
```powershell
cd ruta\al\proyecto\tp6\backend
.venv\Scripts\uvicorn.exe main:app --reload
```

El servidor debe estar corriendo en: http://localhost:8000

**Verificar que el servidor está corriendo:**
- Abrir http://localhost:8000 en el navegador
- Deberías ver: `{"mensaje": "API de Productos - use /productos para obtener el listado"}`

#### Paso 3: Abrir el archivo de pruebas

En VSCode, abrir el archivo:
```
tp6/backend/api-tests.http
```

Verás algo como esto:
```http
### 2.1 - Listar todos los productos
GET {{baseUrl}}/productos
Accept: {{contentType}}
```

#### Paso 4: Ejecutar las peticiones


**Opción 1 - Hacer clic en "Send Request":**
- Aparece un link azul arriba de cada petición
- Hacer clic en **"Send Request"**

**Opción 2 - Atajo de teclado:**
- Posicionar el cursor sobre la petición
- Presionar `Ctrl+Alt+R` (Windows/Linux) o `Cmd+Alt+R` (Mac)


#### Paso 5: Ver la respuesta

La respuesta aparece en un panel lateral con:
- **Status Code**: 200, 404, 401, etc.
- **Headers**: Content-Type, Authorization, etc.
- **Body**: El JSON o contenido de la respuesta

Ejemplo de respuesta exitosa:
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "mensaje": "API de Productos - use /productos para obtener el listado"
}
```

#### Paso 6: Probar el flujo completo

El archivo incluye una **Sección 8** con un flujo completo de prueba:

1. **Registrar usuario** → Ejecutar petición 8.1
2. **Iniciar sesión** → Ejecutar petición 8.2 (guarda el token automáticamente)
3. **Buscar productos** → Ejecutar petición 8.3
4. **Agregar al carrito** → Ejecutar peticiones 8.4 y 8.5
5. **Ver carrito** → Ejecutar petición 8.6
6. **Finalizar compra** → Ejecutar petición 8.7
7. **Ver historial** → Ejecutar petición 8.8

#### Variables automáticas

El archivo usa variables para simplificar las pruebas:

```http
# @name login
POST {{baseUrl}}/iniciar-sesion
Content-Type: {{contentType}}

{
  "email": "juan.perez@example.com",
  "password": "miPassword123"
}

### Guardar el token automáticamente
@token = {{login.response.body.access_token}}
```

Después de hacer login, el token se guarda automáticamente y se usa en las siguientes peticiones.

#### Estructura del archivo

El archivo está organizado en **8 secciones**:

1. **Endpoints Básicos** - Verificar que la API funciona
2. **Productos** - Listar, buscar, filtrar (6 pruebas)
3. **Autenticación** - Registro, login, logout (4 pruebas)
4. **Carrito** - Agregar, quitar, cancelar (6 pruebas)
5. **Finalizar Compra** - Checkout con dirección y tarjeta (2 pruebas)
6. **Historial** - Ver compras anteriores (3 pruebas)
7. **Casos de Error** - Pruebas sin autenticación (3 pruebas)
8. **Flujo Completo** - Prueba de punta a punta (8 pasos)

