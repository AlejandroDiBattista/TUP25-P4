# Tests del Backend

Este directorio contiene las pruebas unitarias para todos los endpoints de la API del proyecto TP6.

## Estructura de Tests

- `conftest.py`: Configuración y fixtures compartidos (base de datos en memoria, usuarios de prueba, tokens, etc.)
- `test_auth.py`: Tests de autenticación (registro, login, obtener usuario actual)
- `test_products.py`: Tests de productos (listar, buscar, filtrar por categoría)
- `test_cart.py`: Tests del carrito (agregar, quitar, cancelar, ver totales)
- `test_checkout.py`: Tests de finalización de compra (checkout, validaciones)
- `test_purchases.py`: Tests del historial de compras (listar, ver detalle)

## Requisitos

Las dependencias de testing ya están incluidas en `pyproject.toml`:

```toml
[dependency-groups]
dev = [
    "httpx>=0.28.1",
    "pytest>=8.4.2",
    "pytest-asyncio>=1.2.0",
]
```

## Ejecutar los Tests

### Ejecutar todos los tests

Desde el directorio `backend/`:

```bash
pytest
```

### Ejecutar tests con más detalles (verbose)

```bash
pytest -v
```

### Ejecutar tests de un archivo específico

```bash
pytest tests/test_auth.py
pytest tests/test_cart.py
```

### Ejecutar un test específico

```bash
pytest tests/test_auth.py::test_register_user
pytest tests/test_cart.py::test_add_item_to_cart
```

### Ver cobertura de código

```bash
pytest --cov=app --cov-report=term-missing
```

### Ejecutar tests y ver print statements

```bash
pytest -s
```

## Cobertura de Tests

Los tests cubren los siguientes aspectos:

### 1. Autenticación (`test_auth.py`)
- ✅ Registro de usuario exitoso
- ✅ Registro con email duplicado (debe fallar)
- ✅ Login exitoso con credenciales válidas
- ✅ Login con credenciales inválidas (debe fallar)
- ✅ Login con usuario inexistente (debe fallar)
- ✅ Obtener usuario actual con token válido
- ✅ Acceso sin token (debe fallar)
- ✅ Acceso con token inválido (debe fallar)

### 2. Productos (`test_products.py`)
- ✅ Listar todos los productos
- ✅ Buscar productos por título
- ✅ Búsqueda case-insensitive
- ✅ Filtrar productos por categoría
- ✅ Combinar búsqueda y filtro
- ✅ Obtener producto por ID
- ✅ Producto inexistente (debe retornar 404)
- ✅ Productos muestran stock disponible
- ✅ Búsqueda sin resultados

### 3. Carrito (`test_cart.py`)
- ✅ Ver carrito vacío
- ✅ Agregar producto al carrito
- ✅ Agregar múltiples productos
- ✅ Aumentar cantidad de producto existente
- ✅ Agregar producto sin stock (debe fallar)
- ✅ Agregar más unidades que el stock (debe fallar)
- ✅ Eliminar producto del carrito
- ✅ Cancelar carrito (vaciar)
- ✅ Obtener totales (subtotal, IVA, envío, total)
- ✅ Totales con costo de envío ($50 si < $1000)
- ✅ Acceso sin autenticación (debe fallar)

### 4. Checkout (`test_checkout.py`)
- ✅ Finalizar compra exitosamente
- ✅ Checkout con carrito vacío (debe fallar)
- ✅ Checkout sin datos completos (debe fallar)
- ✅ Carrito se vacía después del checkout
- ✅ Cálculo correcto de totales en checkout
- ✅ Checkout sin autenticación (debe fallar)

### 5. Historial de Compras (`test_purchases.py`)
- ✅ Listar compras vacías
- ✅ Listar compras del usuario
- ✅ Obtener detalle de una compra
- ✅ Compra inexistente (debe retornar 404)
- ✅ Compra contiene items con detalles
- ✅ Compra almacena totales y envío
- ✅ Acceso sin autenticación (debe fallar)
- ✅ Usuario solo ve sus propias compras

## Fixtures Disponibles

Los siguientes fixtures están disponibles en `conftest.py`:

- `session`: Sesión de base de datos en memoria (SQLite)
- `client`: Cliente de test de FastAPI
- `test_products`: Lista de 4 productos de prueba (con stock variado)
- `test_user`: Usuario de prueba registrado
- `auth_token`: Token de autenticación válido para el usuario de prueba

## Notas Importantes

1. **Base de datos en memoria**: Los tests usan una base de datos SQLite en memoria, por lo que no afectan la base de datos real del proyecto.

2. **Aislamiento**: Cada test es independiente y tiene su propia sesión de base de datos limpia.

3. **Fixtures compartidos**: Los fixtures se reutilizan entre tests para evitar duplicación de código.

4. **Tests de integración**: Aunque son llamados "unitarios", algunos tests prueban flujos completos (ej: crear carrito → agregar productos → finalizar compra).

## Solución de Problemas

### Error: "No module named 'app'"

Asegúrate de ejecutar pytest desde el directorio `backend/`:

```bash
cd backend
pytest
```

### Error: "Database is locked"

Si usas Windows y tienes este error, intenta cerrar cualquier conexión abierta a la base de datos.

### Tests fallan por dependencias

Instala las dependencias de desarrollo:

```bash
pip install pytest httpx pytest-asyncio
```

## Agregar Nuevos Tests

Para agregar nuevos tests:

1. Crea un nuevo archivo `test_*.py` en el directorio `tests/`
2. Importa los fixtures necesarios de `conftest.py`
3. Escribe funciones de test que comiencen con `test_`
4. Usa `assert` para verificar el comportamiento esperado

Ejemplo:

```python
def test_mi_nueva_funcionalidad(client: TestClient, auth_token: str):
    response = client.get(
        "/api/v1/mi-endpoint",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    assert "campo_esperado" in response.json()
```

