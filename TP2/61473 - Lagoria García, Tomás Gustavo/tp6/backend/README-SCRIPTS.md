# Scripts de Backend - E-Commerce TP6

## 📜 Comandos Disponibles

```powershell
# Ver todos los comandos
uv run python scripts.py help

# Inicializar base de datos
uv run python scripts.py init-db

# Iniciar servidor en desarrollo (hot-reload)
uv run python scripts.py dev

# Iniciar servidor en producción
uv run python scripts.py start

# Ejecutar tests
uv run python scripts.py test

# Reset completo de la base de datos (con confirmación)
uv run python scripts.py reset-db
```

## 📋 Descripción de Comandos

| Comando | Descripción |
|---------|-------------|
| `dev` | Inicia servidor con hot-reload para desarrollo |
| `start` | Inicia servidor en modo producción |
| `init-db` | Crea tablas y carga productos desde JSON |
| `reset-db` | Elimina y recrea la base de datos (solicita confirmación) |
| `test` | Ejecuta suite de tests con pytest |
| `help` | Muestra ayuda detallada de comandos |

## 🔄 Flujo de Trabajo

### Primera vez:
```powershell
cd backend
uv run python scripts.py init-db
# 3. Iniciar servidor en desarrollo
uv run python scripts.py dev
```

### Desarrollo diario:
```powershell
cd backend
uv run python scripts.py dev
```

### Cambios en modelos:
```powershell
cd backend
uv run python scripts.py reset-db
uv run python scripts.py dev
```

### Antes de commit:
```powershell
cd backend
uv run python scripts.py test
```

## 🌐 URLs del Servidor

Cuando el servidor está corriendo:
- **API:** http://localhost:8000
- **Documentación:** http://localhost:8000/docs

## ⚠️ Notas Importantes

- Debes estar en el directorio `backend` para ejecutar los comandos
- Los comandos no requieren `.\` como en PowerShell tradicional
- El servidor en modo `dev` recarga automáticamente al detectar cambios

## 🐛 Solución de Problemas

**"can't open file 'scripts.py'"**
```powershell
cd backend  # Asegúrate de estar en el directorio correcto
```

**"uv: comando no encontrado"**
```powershell
$env:Path = "C:\Users\$env:USERNAME\.local\bin;$env:Path"
```

**"Puerto 8000 ya en uso"**
- Detén otros servidores en el puerto 8000
- O modifica el puerto en `scripts.py`
