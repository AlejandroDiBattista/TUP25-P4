# TP6 - Ecommerce (61335)

## Objetivo
Implementar un mini ecommerce con:
- Backend FastAPI + SQLModel (SQLite) con autenticación JWT.
- Frontend Next.js (App Router) + TailwindCSS.
- Funcionalidades: registro/login, listado y detalle de productos, carrito con IVA y envío, checkout y historial de compras.

## Backend
### Requisitos
Python 3.11+ y paquetes definidos en `pyproject.toml` / `requirements.txt`.

### Instalación
```powershell
cd "tp/61335 - León, Lucas Ismael/tp6/backend"
pip install -r requirements.txt
```

### Ejecutar
```powershell
cd "tp/61335 - León, Lucas Ismael/tp6/backend"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
La API queda en: http://localhost:8000
Documentación interactiva: http://localhost:8000/docs

## Frontend
### Requisitos
Node.js 18+ (se probó con 18/20) y npm.

### Instalación
```powershell
cd "tp/61335 - León, Lucas Ismael/tp6/frontend"
npm install
```

### Variables de entorno
Crear `frontend/.env.local` si no existe:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Ejecutar
```powershell
cd "tp/61335 - León, Lucas Ismael/tp6/frontend"
npm run dev
```
Aplicación: http://localhost:3000

## Flujo principal
1. Registrar usuario (Registro) o usar uno existente.
2. Iniciar sesión (Login) => guarda token en `localStorage` y actualiza encabezado.
3. Listar productos y agregar al carrito (se re-calcula IVA, envío y total).
4. Ajustar cantidades / eliminar items / cancelar carrito.
5. Finalizar compra en Checkout (valida carrito no vacío, descuenta stock, enmascara tarjeta).
6. Ver historial en "Mis compras" con detalle enriquecido (productos, IVA, totales, dirección y tarjeta).
7. Logout invalida token (lista negra) y limpia estado local.

## Reglas de negocio
- IVA: 21% general; 10% para categoría 'electronica'.
- Envío: $0 si carrito vacío, $0 si subtotal > 1000; caso contrario $50.
- Stock se descuenta al finalizar compra; si falta stock se rechaza.

## Tests backend
Ubicados en `backend/tests/test_api.py`.
Ejecutar (opcional):
```powershell
cd "tp/61335 - León, Lucas Ismael/tp6/backend"
pytest -q
```

## Eventos Frontend
- `token-change`: disparado tras login/logout para sincronizar encabezado.
- `cart-updated`: dispara refresco del sidebar y páginas relacionadas.

## Endpoints principales
- POST `/registrar` (nombre, email, password)
- POST `/iniciar-sesion` (OAuth2 form) => token
- POST `/cerrar-sesion` => invalida token
- GET `/productos` / GET `/productos/{id}`
- GET `/carrito` / POST `/carrito` / PATCH `/carrito` / DELETE `/carrito/{id}` / POST `/carrito/cancelar` / POST `/carrito/finalizar`
- GET `/compras` / GET `/compras/{id}`
- GET `/me`

## Seguridad
- Hash de contraseña con `pbkdf2_sha256` (Passlib).
- JWT con `sub` = id usuario y `jti` único (timestamp) para logout.
- Lista negra en memoria para invalidar tokens cerrados.

## Consideraciones de Entrega
- Se eliminaron endpoints y comentarios de depuración.
- Código reducido a lo esencial; sin `console.log` ni bloques explicativos extensos.
- Estilos unificados (botones negros primarios).

## Próximos posibles pasos (no requeridos)
- Paginación de productos.
- Cache de productos.
- Refresh tokens persistentes.
- Roles / permisos.

---
TP6 - 61335
