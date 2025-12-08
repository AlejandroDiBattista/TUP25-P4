# Tests Unitarios - TP6 E-commerce API

## 📋 Resumen de Tests

**Total de tests: 27**  
**Tests exitosos: 27 ✅**  
**Cobertura: Productos, Autenticación, Carrito, Compras**

---

## 🧪 Suites de Tests

### 1. **Tests de Productos** (5 tests)
- ✅ Listar todos los productos
- ✅ Buscar productos por término
- ✅ Búsqueda case-insensitive
- ✅ Filtrar por categoría
- ✅ Búsqueda sin resultados

### 2. **Tests de Autenticación** (8 tests)
- ✅ Registro exitoso
- ✅ Registro con email duplicado (error)
- ✅ Login exitoso
- ✅ Login con contraseña incorrecta (error)
- ✅ Login con usuario inexistente (error)
- ✅ Acceso sin token (unauthorized)
- ✅ Acceso con token inválido (unauthorized)

### 3. **Tests de Carrito** (8 tests)
- ✅ Ver carrito vacío
- ✅ Agregar producto al carrito
- ✅ Agregar producto inexistente (error)
- ✅ Agregar más cantidad que stock (error)
- ✅ Quitar producto del carrito
- ✅ Vaciar carrito completo (DELETE /carrito)
- ✅ Cancelar compra (POST /carrito/cancelar)
- ✅ Cancelar compra con carrito vacío (error)

### 4. **Tests de Compras** (6 tests)
- ✅ Finalizar compra exitosamente
- ✅ Finalizar compra con carrito vacío (error)
- ✅ Ver historial de compras
- ✅ Ver historial vacío
- ✅ Ver detalle de compra específica
- ✅ Ver detalle de compra inexistente (error)
- ✅ No permitir ver compras de otros usuarios

---

## 🚀 Ejecutar Tests

### Todos los tests:
```bash
pytest test_main.py -v
```

### Tests específicos:
```bash
# Solo tests de productos
pytest test_main.py::TestProductos -v

# Solo tests de autenticación
pytest test_main.py::TestAutenticacion -v

# Solo tests de carrito
pytest test_main.py::TestCarrito -v

# Solo tests de compras
pytest test_main.py::TestCompras -v
```

### Con cobertura:
```bash
pytest test_main.py --cov=main --cov-report=html
```

---

## 📁 Archivos de Test

- `conftest.py` - Fixtures compartidas (sesión DB, cliente, autenticación)
- `test_main.py` - Suite completa de tests
- `pytest.ini` - Configuración de pytest

---

## 🔧 Tecnologías

- **pytest** - Framework de testing
- **FastAPI TestClient** - Cliente HTTP para tests
- **SQLModel** - ORM con base de datos en memoria para tests
- **httpx** - Cliente HTTP asíncrono

---

## 📝 Notas

- Los tests usan una **base de datos en memoria** (SQLite) independiente
- Cada test es **aislado** y no afecta a los demás
- Los fixtures de `conftest.py` crean productos de prueba automáticamente
- Los tests verifican tanto casos exitosos como errores esperados
