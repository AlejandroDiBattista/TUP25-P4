# Script para iniciar el servidor y ejecutar tests de autenticación

Write-Host "🚀 Iniciando servidor FastAPI..." -ForegroundColor Cyan
$serverJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\54381\OneDrive\Escritorio\tup25-p4\tp\61271 - Donelli, Gerardo Exequíel\tp6\backend"
    uv run uvicorn main:app
}

Write-Host "⏳ Esperando 5 segundos para que el servidor inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`n🧪 Ejecutando tests de autenticación..." -ForegroundColor Cyan
Set-Location "C:\Users\54381\OneDrive\Escritorio\tup25-p4\tp\61271 - Donelli, Gerardo Exequíel\tp6\backend"
uv run python test_auth.py

Write-Host "`n🛑 Deteniendo servidor..." -ForegroundColor Yellow
Stop-Job $serverJob
Remove-Job $serverJob

Write-Host "✅ Tests completados!" -ForegroundColor Green
