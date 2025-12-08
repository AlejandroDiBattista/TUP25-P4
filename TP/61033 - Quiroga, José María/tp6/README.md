# TP6 - Entrega (Quiroga, José María)

Instrucciones para ejecutar la aplicación full-stack (backend FastAPI + frontend Next.js) localmente.

Requisitos
- Windows PowerShell (el proyecto fue preparado usando PowerShell).
- Python 3.11+ (o la versión usada por el repositorio)
- Node.js 18+ y npm

Backend (API)
1. Abrir PowerShell y situarse en la carpeta `tp/61033 - Quiroga, José María/tp6/backend`.
2. Ejecutar el script de arranque (crea/usa venv y arranca uvicorn en 127.0.0.1:8000):

```powershell
./start-backend.ps1
```

3. Alternativamente para ver logs en primer plano (útil para debug):

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

4. Verificar endpoint:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8000/productos | ConvertTo-Json -Depth 3
```

Frontend (Next.js)
1. Abrir PowerShell y situarse en `tp/61033 - Quiroga, José María/tp6/frontend/next-app`.
2. Ejecutar el script de arranque (instala dependencias si faltan y arranca `npm run dev`):

```powershell
./start-frontend.ps1
```

3. Abrir el navegador en `http://localhost:3000`.

Notas
- El backend carga productos desde `backend/productos.json` al arrancar (si la base no existe). Si algunos productos aparecen sin `nombre`, revisar el JSON original — el loader acepta `titulo` y `nombre`.
- Si hay dos carpetas `frontend` (una en root y otra en el TP del alumno), usar la que está en `tp/.../frontend/next-app` para la presentación.

Problemas comunes y soluciones
- Si el puerto 8000 está ocupado: localizar y cerrar el proceso (por ejemplo con `Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess` y luego `Stop-Process -Id <PID>`).
- Si el frontend no muestra productos: abrir DevTools > Network y comprobar la llamada a `/productos` (status 200 y payload JSON).

Contacto
- Quiroga, José María
