# Backend - API Comercio

Backend implementado con FastAPI y SQLModel (SQLite) para el TP6.

Características implementadas hasta ahora:
- Estructura de la app bajo `app/` (models, db, auth, crud, routers)
- Endpoints de autenticación: `/auth/registrar`, `/auth/token`, `/auth/logout`
- Endpoints de productos: `/productos/`, `/productos/{id}`
- Endpoints de carrito: `/carrito/` (agregar), `DELETE /carrito/{product_id}` (quitar), `GET /carrito/`, `POST /carrito/finalizar`, `POST /carrito/cancelar`
- Endpoints de compras: `/compras/`, `/compras/{id}`
- Script de carga inicial: `load_data.py` que carga `productos.json` a la base `database.db`
- Tests básicos en `tests/test_cart_purchase.py` que cubren registro -> agregar al carrito -> finalizar -> listar compras

Requisitos (local):
- Python 3.13+
- Instalar dependencias (recomendado en virtualenv)

Instalación y ejecución (PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -U pip
# instalar dependencias desde pyproject.toml
pip install -e .
# o instalar manualmente
pip install fastapi sqlmodel uvicorn[standard] python-jose[cryptography] passlib[bcrypt] pytest httpx pytest-asyncio
```

Cargar datos iniciales y ejecutar:

```powershell
python .\load_data.py
uvicorn main:app --reload
```

Ejecutar tests (desde carpeta `backend`):

```powershell
# con venv activado
pytest -q
```

Docker / Desarrollo con contenedor

Incluí un `Dockerfile` y `docker-compose.yml` para levantar el servicio en desarrollo.

Ejemplo (desde carpeta `backend`):

```powershell
# construir la imagen
docker compose build
# crear archivo .env (puedes copiar .env.example)
docker compose up
```

El contenedor monta `database.db` y la carpeta `imagenes` como volúmenes para persistencia y pruebas locales.

Notas:
- El logout implementa una lista negra en memoria; para entornos reales usar una tabla/Redis.
- Las reglas de IVA y envío se aplican en el endpoint de finalización de compra:
  - IVA 21% general, 10% para categoría que contenga "electr" (Electrónica)
  - Envío gratuito si total sin IVA > $1000, sino $50
- Para avanzar: optimizar validaciones, agregar manejo de errores más detallado, y cubrir más tests (edge cases)


Configuración y secretos

- El `SECRET_KEY` para firmar JWT ahora se lee desde la variable de entorno `SECRET_KEY` o desde un archivo `.env` en la carpeta `backend`.

- Para desarrollo: copia `.env.example` a `.env` y edita los valores sensibles. Ejemplo mínimo:

```
SECRET_KEY=mi_clave_de_desarrollo
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOW_ORIGINS=http://localhost:3000
```

He incluido un fichero `.env.example` con las variables más importantes.

Buenas prácticas:

- En producción no uses `ALLOW_ORIGINS=*`. Define explícitamente los orígenes que consumen tu API.
- Generá un `SECRET_KEY` fuerte y mantenelo fuera del repositorio (variables de entorno / secret manager).

Si necesitás, puedo añadir una tarea para validar `ALLOW_ORIGINS` y distinguir entre entornos (DEV/PROD).

Nota sobre entorno y seguridad

- El comportamiento de arranque depende de la variable `ENV`:
  - `development` (por defecto): si `SECRET_KEY` no está configurado se emitirá una advertencia.
  - `production`: si `SECRET_KEY` usa el valor por defecto la aplicación fallará al iniciar para evitar exponer una clave insegura.

Copiá `.env.example` a `.env` y definí `ENV=production` en el entorno de despliegue junto con un `SECRET_KEY` seguro.

Control de logs

- Podés ajustar el nivel de logs con la variable `LOG_LEVEL` en `.env` (valores: DEBUG, INFO, WARNING, ERROR, CRITICAL). Por defecto el backend usa `INFO`.

Ejemplo mínimo de `.env` con nivel de logs:

```
SECRET_KEY=mi_clave_de_desarrollo
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOW_ORIGINS=http://localhost:3000
LOG_LEVEL=INFO
ENV=development
```

Si querés que ejecute los tests aquí, necesitás indicar que instale dependencias en este entorno (o las podés instalar localmente con los comandos anteriores). Si preferís, continúo implementando validaciones adicionales y mejoras de seguridad (e.g., token jti, refresh tokens).