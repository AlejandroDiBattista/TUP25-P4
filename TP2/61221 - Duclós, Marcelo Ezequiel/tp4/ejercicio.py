#TP4: Calculadora de prestamos - Sistema Francés

print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  : "))
tasa    = float(input("Tasa Nominal Anual (TNA)    : "))
cuotas  = int(input("Cantidad de cuotas mensuales: "))

## === Realizar los cálculos ===

# Calcular la tasa periódica mensual
tasa_periodica = tasa / 12

# Calcular la cuota fija mensual usando la fórmula del sistema francés
# Cuota = P * (i * (1 + i) ** n) / ((1 + i) ** n - 1)
cuota_fija = capital * (tasa_periodica * (1 + tasa_periodica) ** cuotas) / ((1 + tasa_periodica) ** cuotas - 1)

# Calcular TEA (Tasa Efectiva Anual)
# TEA = (1 + i) ** 12 - 1
tea = (1 + tasa_periodica) ** 12 - 1

# === Mostrar resultados ===
print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota_fija:.2f}")
print(f"Tasa periódica (TNA/12):   {tasa_periodica * 100:5.2f}%")
print(f"TEA (efectiva anual)   :  {tea * 100:6.2f}%")

# === Generar tabla de amortización ===
print("\nCronograma de pagos:")

# Encabezados de la tabla
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-" * 10 + " " + "-" * 10 + " " + "-" * 10 + " " + "-" * 10 + " " + "-" * 10)

# Lista para almacenar los datos de cada cuota
tabla_amortizacion = []

# Variables para acumular totales
pago_total = 0
capital_total = 0
interes_total = 0

# Saldo inicial
saldo = capital

# Generar cada fila de la tabla
for mes in range(1, cuotas + 1):
    # Calcular interés del mes
    interes = saldo * tasa_periodica
    
    # Calcular capital amortizado
    capital_amortizado = cuota_fija - interes
    
    # Actualizar saldo
    saldo = saldo - capital_amortizado
    
    # Ajuste para evitar saldo negativo en la última cuota por redondeo
    if mes == cuotas and abs(saldo) < 0.01:
        saldo = 0
    
    # Almacenar los datos de la cuota en un diccionario
    registro = {
        'mes': mes,
        'pago': cuota_fija,
        'capital': capital_amortizado,
        'interes': interes,
        'saldo': saldo
    }
    tabla_amortizacion.append(registro)
    
    # Acumular totales
    pago_total += cuota_fija
    capital_total += capital_amortizado
    interes_total += interes
    
    # Imprimir fila con formato de 10 caracteres y 2 decimales
    print(f"{mes:>10} {cuota_fija:>10.2f} {capital_amortizado:>10.2f} {interes:>10.2f} {saldo:>10.2f}")

# Mostrar totales
print("\nTotales:")
print(f"  Pago   : ${pago_total:,.2f}")
print(f"  Capital:  ${capital_total:,.2f}")
print(f"  Interés:  ${interes_total:,.2f}")
