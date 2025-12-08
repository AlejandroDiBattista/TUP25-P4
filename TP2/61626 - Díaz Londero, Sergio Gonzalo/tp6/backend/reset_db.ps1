# Script de PowerShell para resetear la base de datos
# Uso: .\reset_db.ps1

Write-Host "🔄 Reseteando base de datos..." -ForegroundColor Yellow

$backendPath = "c:\Users\sgonz\OneDrive\Documentos\GitHub-Repositorios\tup25-p4\tp\61626 - Díaz Londero, Sergio Gonzalo\tp6\backend"

# Cambiar al directorio del backend
Set-Location $backendPath

# Eliminar carpeta data si existe
if (Test-Path "data") {
    try {
        Remove-Item -Recurse -Force "data"
        Write-Host "✅ Carpeta 'data' eliminada" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error al eliminar carpeta data: $_" -ForegroundColor Red
    }
}

# Eliminar tienda.db si existe
if (Test-Path "tienda.db") {
    try {
        Remove-Item -Force "tienda.db"
        Write-Host "✅ Archivo 'tienda.db' eliminado" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error al eliminar tienda.db: $_" -ForegroundColor Red
    }
}

Write-Host "✅ Base de datos reseteada exitosamente" -ForegroundColor Green
Write-Host "💡 Ahora puedes iniciar el servidor backend:" -ForegroundColor Cyan
Write-Host "   uvicorn main:app --reload --port 8000" -ForegroundColor White