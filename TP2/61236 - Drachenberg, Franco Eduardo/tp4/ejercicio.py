#TP4: Calculadora de prestamos - Sistema Francés


print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  : "))
tasa    = float(input("Tasa Nominal Anual (TNA)    : "))
cuotas  = int( input("Cantidad de cuotas mensuales:: "))

## === Realizar los calculos ===

# Calcular las cuotas mensuales y la tasa periódica
tasa_periodica = tasa / 12
tea = (1 + tasa_periodica) ** 12 - 1

if tasa_periodica > 0:
    numerador = tasa_periodica * (1 + tasa_periodica) ** cuotas
    denominador = (1 + tasa_periodica) ** cuotas - 1
    cuota_fija = capital * (numerador / denominador)
else:
    cuota_fija = capital / cuotas if cuotas > 0 else 0

# Mostrar resultados
print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota_fija:.2f}")
print(f"Tasa periodica (TNA/12) : {tasa_periodica:.2%}")
print(f"TEA (efectiva anual)    : {tea:.2%}")

# Cornograma de pagos
print("\nCronograma de pagos:")
print("   Mes        Pago     Capital    Interes     Saldo   ")
print("---------- ---------- ---------- ---------- ----------")

saldo_restante = capital
pago_total = 0.0
capital_total = 0.0
interes_total = 0.0

for mes in range(1, cuotas + 1):
    interes_pagado = saldo_restante * tasa_periodica
    capital_amortizado = cuota_fija - interes_pagado
    saldo_restante -= capital_amortizado
    pago_total += cuota_fija
    capital_total += capital_amortizado
    interes_total += interes_pagado
    saldo_a_mostrar = saldo_restante if mes != cuotas else 0.0
    
    # Print ancho 10, 2 decimales
    print(f"{mes: >10d} {cuota_fija: >10.2f} {capital_amortizado: >10.2f} {interes_pagado: >10.2f} {saldo_a_mostrar: >10.2f}")

# Mostrar los resultados en el formato pedido

print("Totales:")
print(f"  Pago   :  ${pago_total:,.2f}")
print(f"  Capital:  ${capital_total:,.2f}")
print(f"  Interés:  ${interes_total:,.2f}")
