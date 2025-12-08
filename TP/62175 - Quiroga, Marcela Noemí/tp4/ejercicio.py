#TP4: Calculadora de prestamos - Sistema Francés

# Cuota, tasa periódica y TEA:
tasaper = (tasa / 100) / 12
cuota = capital * (tasaper * (1 + tasaper) ** cuotas) / ((1 + tasaper) ** cuotas - 1)
tea = (1 + tasaper) ** 12 - 1

print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12): {tasaper * 100:8.2f}%")
print(f"TEA (efectiva anual)   : {tea * 100:8.2f}%")
print("\nCronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-" * 50)

saldo = capital
pago_total = 0
capital_total = 0
interes_total = 0

for mes in range(1, cuotas + 1):
    interes = saldo * tasaper
    amortizacion = cuota - interes
    saldo -= amortizacion

    if mes == cuotas:
        saldo = 0.0

    pago_total += cuota
    capital_total += amortizacion
    interes_total += interes

    print(f"{mes:10d}{cuota:10.2f}{amortizacion:10.2f}{interes:10.2f}{saldo:10.2f}")

#---------------------------------------------------------------------------------------

# Resultados:
print(" •   Totales:")
print(f"    -   💵 Pago   :  ${pago_total:,.2f}")
print(f"    -   💰 Capital:  ${capital_total:,.2f}")
print(f"    -   📈 Interés:  ${interes_total:,.2f}")

#---------------------------------------------------------------------------------------
