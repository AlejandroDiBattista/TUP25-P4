# Script de prueba del flujo completo de TP6
Write-Host ""
Write-Host "PRUEBA DE FLUJO COMPLETO - TP6 E-Commerce" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000"
$email = "testflow_$(Get-Random)@test.com"
$password = "test123"

# Paso 1: Registrar usuario
Write-Host ""
Write-Host "Paso 1: Registrando nuevo usuario..." -ForegroundColor Yellow
try {
    $registerBody = @{
        email = $email
        nombre = "Usuario Test"
        password = $password
    } | ConvertTo-Json

    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/registrar" -Method Post -Body $registerBody -ContentType "application/json"
    $token = $registerResponse.access_token
    Write-Host "   OK Usuario registrado: $email" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "   ERROR en registro: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Paso 2: Login
Write-Host ""
Write-Host "Paso 2: Iniciando sesion..." -ForegroundColor Yellow
try {
    $loginBody = "username=$email&password=$password"
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/token" -Method Post -Body $loginBody -ContentType "application/x-www-form-urlencoded"
    $token = $loginResponse.access_token
    Write-Host "   OK Login exitoso" -ForegroundColor Green
} catch {
    Write-Host "   ERROR en login: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Paso 3: Obtener productos
Write-Host ""
Write-Host "Paso 3: Obteniendo productos..." -ForegroundColor Yellow
try {
    $productos = Invoke-RestMethod -Uri "$baseUrl/productos"
    Write-Host "   OK $($productos.Count) productos disponibles" -ForegroundColor Green
    $producto1 = $productos[0]
    $producto2 = $productos[1]
    Write-Host "   - Producto 1: ID=$($producto1.id) - $($producto1.titulo)" -ForegroundColor Gray
    Write-Host "   - Producto 2: ID=$($producto2.id) - $($producto2.titulo)" -ForegroundColor Gray
} catch {
    Write-Host "   ERROR al obtener productos: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Paso 4: Agregar productos al carrito
Write-Host ""
Write-Host "Paso 4: Agregando productos al carrito..." -ForegroundColor Yellow
try {
    $headers = @{ "Authorization" = "Bearer $token" }
    
    # Agregar producto 1
    $addBody1 = @{ producto_id = $producto1.id; cantidad = 2 } | ConvertTo-Json
    $null = Invoke-RestMethod -Uri "$baseUrl/carrito/agregar" -Method Post -Body $addBody1 -ContentType "application/json" -Headers $headers
    Write-Host "   OK Agregado: 2x $($producto1.titulo)" -ForegroundColor Green
    
    # Agregar producto 2
    $addBody2 = @{ producto_id = $producto2.id; cantidad = 1 } | ConvertTo-Json
    $null = Invoke-RestMethod -Uri "$baseUrl/carrito/agregar" -Method Post -Body $addBody2 -ContentType "application/json" -Headers $headers
    Write-Host "   OK Agregado: 1x $($producto2.titulo)" -ForegroundColor Green
} catch {
    Write-Host "   ERROR al agregar al carrito: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Paso 5: Ver carrito
Write-Host ""
Write-Host "Paso 5: Consultando carrito..." -ForegroundColor Yellow
try {
    $carrito = Invoke-RestMethod -Uri "$baseUrl/carrito" -Headers $headers
    Write-Host "   OK Carrito tiene $($carrito.Count) productos" -ForegroundColor Green
    $total = 0
    foreach ($item in $carrito) {
        $subtotal = $item.precio * $item.cantidad
        $total += $subtotal
        Write-Host "   - $($item.nombre) x$($item.cantidad) = `$$($subtotal)" -ForegroundColor Gray
    }
    Write-Host "   Total: `$$total" -ForegroundColor Cyan
} catch {
    Write-Host "   ERROR al consultar carrito: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Paso 6: Finalizar compra
Write-Host ""
Write-Host "Paso 6: Finalizando compra..." -ForegroundColor Yellow
try {
    $checkoutBody = "direccion=Calle Test 123, Ciudad&tarjeta=1234567890123456"
    $compra = Invoke-RestMethod -Uri "$baseUrl/carrito/finalizar" -Method Post -Body $checkoutBody -ContentType "application/x-www-form-urlencoded" -Headers $headers
    Write-Host "   OK Compra finalizada - ID: $($compra.id)" -ForegroundColor Green
    Write-Host "   Total pagado: `$$($compra.total)" -ForegroundColor Cyan
    Write-Host "   Direccion: $($compra.direccion)" -ForegroundColor Gray
} catch {
    Write-Host "   ERROR al finalizar compra: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Paso 7: Ver historial de compras
Write-Host ""
Write-Host "Paso 7: Consultando historial de compras..." -ForegroundColor Yellow
try {
    $compras = Invoke-RestMethod -Uri "$baseUrl/compras" -Headers $headers
    Write-Host "   OK Total de compras: $($compras.Count)" -ForegroundColor Green
    foreach ($c in $compras) {
        Write-Host "   - Compra #$($c.id): `$$($c.total) - $($c.fecha)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ERROR al consultar compras: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Paso 8: Verificar que el carrito está vacío
Write-Host ""
Write-Host "Paso 8: Verificando carrito vacio despues de compra..." -ForegroundColor Yellow
try {
    $carritoFinal = Invoke-RestMethod -Uri "$baseUrl/carrito" -Headers $headers
    if ($carritoFinal.Count -eq 0) {
        Write-Host "   OK Carrito vacio correctamente" -ForegroundColor Green
    } else {
        Write-Host "   ADVERTENCIA: El carrito deberia estar vacio pero tiene $($carritoFinal.Count) items" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ERROR al verificar carrito: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "           PRUEBA COMPLETADA EXITOSAMENTE            " -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""
