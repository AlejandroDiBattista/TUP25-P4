# 🚀 Guía Rápida - Cómo Levantar el Proyecto

Esta guía te explica paso a paso cómo iniciar el backend y el frontend del proyecto TP6.

---

## ✅ Verificar Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Python 3.13+** - Verifica con: `python --version`
- ✅ **Node.js 20+** - Verifica con: `node --version`
- ✅ **uv** - Verifica con: `uv --version`

Si falta alguno, consulta el archivo `como-configurar-sistema.md` para instrucciones de instalación.

---

## 🔧 Paso 1: Abrir PowerShell o CMD

1. Presiona `Win + R`
2. Escribe `powershell` (o `cmd`)
3. Presiona Enter

---

## 🐍 Paso 2: Levantar el Backend (API)

### 2.1 Navegar a la carpeta del backend

```powershell
cd "c:\Users\lance\Documents\GitHub\tup25-p4\tp\61312 - Paz Berrondo, Lucas David\tp6\backend"
```

**Nota:** Reemplaza la ruta con la ubicación real de tu proyecto.

### 2.2 Iniciar el servidor backend

**Opción 1 - Usando uv (Recomendado):**
```powershell
uv run uvicorn main:app --reload
```

**Opción 2 - Usando el entorno virtual directamente:**
```powershell
.venv\Scripts\uvicorn.exe main:app --reload
```

### 2.3 Verificar que el backend funciona

Deberías ver algo como:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [67890]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Abrir en el navegador:**
- API: http://localhost:8000
- Documentación: http://localhost:8000/docs
- Productos: http://localhost:8000/productos

Si ves `{"mensaje": "API de Productos - use /productos para obtener el listado"}` en http://localhost:8000, ¡el backend está funcionando! ✅

---

## ⚛️ Paso 3: Levantar el Frontend (Aplicación Web)

### 3.1 Abrir una NUEVA terminal PowerShell/CMD

**IMPORTANTE:** No cierres la terminal del backend. Abre una nueva terminal:

1. Presiona `Win + R`
2. Escribe `powershell` (o `cmd`)
3. Presiona Enter

### 3.2 Navegar a la carpeta del frontend

```powershell
cd "c:\Users\lance\Documents\GitHub\tup25-p4\tp\61312 - Paz Berrondo, Lucas David\tp6\frontend"
```

### 3.3 Iniciar el servidor frontend

```powershell
npm run dev
```

### 3.4 Verificar que el frontend funciona

Deberías ver algo como:
```
  ▲ Next.js 16.0.1
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.5s
```

**Abrir en el navegador:**
- Aplicación: http://localhost:3000

Si ves el catálogo de productos con imágenes, ¡el frontend está funcionando! ✅

---

## 🎯 Resumen de URLs

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Backend API** | http://localhost:8000 | API principal |
| **Backend Docs** | http://localhost:8000/docs | Documentación interactiva |
| **Frontend** | http://localhost:3000 | Aplicación web |

---

## 🧪 Probar el Sistema

### Opción 1: Usar la Aplicación Web

1. Abrir http://localhost:3000
2. Hacer clic en "Iniciar Sesión"
3. Registrarse con un nuevo usuario
4. Explorar productos
5. Agregar productos al carrito
6. Finalizar compra
7. Ver historial de compras

### Opción 2: Usar REST Client (VSCode)

1. Abrir VSCode
2. Abrir el archivo `backend/api-tests.http`
3. Hacer clic en "Send Request" para ejecutar las pruebas
4. Ver las respuestas en el panel lateral

---

## ❌ Detener los Servidores

### Detener el Backend
En la terminal del backend, presionar `Ctrl + C`

### Detener el Frontend
En la terminal del frontend, presionar `Ctrl + C`

---

## 🔍 Solución de Problemas

### Error: "Puerto 8000 ya está en uso"

**Solución:** Otro proceso está usando el puerto 8000.

**Windows:**
```powershell
# Encontrar el proceso
netstat -ano | findstr :8000

# Matar el proceso (reemplaza PID con el número mostrado)
taskkill /PID <PID> /F
```

### Error: "Puerto 3000 ya está en uso"

Next.js usará automáticamente el puerto 3001. Revisa la terminal para ver el puerto asignado.

### Error: "uv: command not found"

**Solución:** uv no está instalado o no está en el PATH.

Instalar uv:
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Luego cerrar y volver a abrir PowerShell.

### Error: "npm: command not found"

**Solución:** Node.js no está instalado o no está en el PATH.

1. Descargar Node.js desde https://nodejs.org/
2. Instalar la versión LTS
3. Cerrar y volver a abrir PowerShell

### Error: Base de datos bloqueada

**Solución:** Cerrar todos los servidores y volver a iniciarlos.

```powershell
# Detener todos los procesos (Ctrl + C en cada terminal)
# Eliminar el archivo de base de datos
cd backend
del ecommerce.db

# Volver a iniciar el backend
uv run uvicorn main:app --reload
```

### Error: Frontend no muestra productos

**Verificar:**
1. ✅ El backend está corriendo en http://localhost:8000
2. ✅ No hay errores en la consola del navegador (F12)
3. ✅ La URL del backend es correcta

---

## 📝 Comandos de Referencia Rápida

### Backend
```powershell
# Ir a la carpeta
cd "ruta\al\proyecto\tp6\backend"

# Iniciar servidor
uv run uvicorn main:app --reload

# Ejecutar tests
uv run pytest
```

### Frontend
```powershell
# Ir a la carpeta
cd "ruta\al\proyecto\tp6\frontend"

# Iniciar servidor
npm run dev

# Compilar para producción
npm run build

# Ejecutar linter
npm run lint
```

---

## 🎓 Flujo de Trabajo Normal

### Primera vez:
1. Instalar dependencias del backend: `cd backend && uv sync`
2. Instalar dependencias del frontend: `cd frontend && npm install`

### Cada vez que trabajes:
1. Abrir terminal 1 → Backend: `cd backend && uv run uvicorn main:app --reload`
2. Abrir terminal 2 → Frontend: `cd frontend && npm run dev`
3. Abrir navegador → http://localhost:3000

### Al terminar:
1. `Ctrl + C` en terminal del backend
2. `Ctrl + C` en terminal del frontend

---

## ✅ Checklist de Verificación

Antes de entregar el proyecto, verifica:

- [ ] El backend inicia sin errores en http://localhost:8000
- [ ] El frontend inicia sin errores en http://localhost:3000
- [ ] Puedes registrar un nuevo usuario
- [ ] Puedes iniciar sesión
- [ ] Los productos se muestran con imágenes
- [ ] Puedes agregar productos al carrito
- [ ] Puedes finalizar una compra
- [ ] Puedes ver el historial de compras
- [ ] Los tests del backend pasan: `uv run pytest`
- [ ] No hay errores en la consola del navegador (F12)

---

**¡Listo!** 🎉 Ahora puedes desarrollar y probar tu sistema de e-commerce.

Para más información, consulta:
- `README.md` - Documentación completa
- `PLAN-DESARROLLO.md` - Plan de commits y desarrollo
- `como-probar-backend.md` - Guía de pruebas con REST Client
