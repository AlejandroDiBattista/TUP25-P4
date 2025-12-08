# TP4: Calculadora de préstamos - Sistema Francés

import math

print("Calculadora de Amortización - Sistema Francés \n")
print("=== Ingresar datos del préstamo ===")

capital = float(input("Monto inicial del préstamo  : "))
tasa    = float(input("Tasa Nominal Anual (TNA)    : "))
cuotas  = int(input("Cantidad de cuotas mensuales: "))

# === Realizar los calculos ===

# Convertir la TNA a tasa mensual (tasa periódica)
tasa_periodica = tasa / 12

# Calcular la cuota fija según el sistema francés
numerador = tasa_periodica * (1 + tasa_periodica) ** cuotas
denominador = (1 + tasa_periodica) ** cuotas - 1
cuota_fija = capital * (numerador / denominador)

# Calcular la TEA (Tasa Efectiva Anual)
tea = (1 + tasa_periodica) ** 12 - 1

# Mostrar resultados generales
print("\n=== Resultados ===")
print(f"Cuota fija (mensual)   : ${cuota_fija:.2f}")
print(f"Tasa periódica (TNA/12): {tasa_periodica * 100:.2f}%")
print(f"TEA (efectiva anual)   : {tea * 100:.2f}%")

# === Cronograma de pagos ===
print("\nCronograma de pagos:")
encabezado = "Mes".ljust(10) + "Pago".ljust(12) + "Capital".ljust(12) + "Interés".ljust(12) + "Saldo".ljust(12)
print(encabezado)
print("-" * len(encabezado))

saldo_restante = capital
pago_total = 0.0
capital_total = 0.0
interes_total = 0.0

# calcular cada cuota
for mes in range(1, cuotas + 1):
    interes_pagado = saldo_restante * tasa_periodica
    capital_amortizado = cuota_fija - interes_pagado
    nuevo_saldo = saldo_restante - capital_amortizado

    if mes == cuotas:
        capital_amortizado = saldo_restante
        pago_ajustado = capital_amortizado + interes_pagado
        nuevo_saldo = 0.00
    else:
        pago_ajustado = cuota_fija

    saldo_restante = nuevo_saldo

    pago_total += pago_ajustado
    capital_total += capital_amortizado
    interes_total += interes_pagado

    print(f"{mes:<10d}{pago_ajustado:<12.2f}{capital_amortizado:<12.2f}{interes_pagado:<12.2f}{saldo_restante:<12.2f}")

# === Totales ===
print("\nTotales:")
print(f"  Pago total : ${pago_total:,.2f}")
print(f"  Capital    : ${capital_total:,.2f}")
print(f"  Interés    : ${interes_total:,.2f}")