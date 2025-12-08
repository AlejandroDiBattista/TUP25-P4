

print("Calculadora de Amortización - Sistema Francés")

print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  : "))
tasa    = float(input("Tasa Nominal Anual (TNA)    : "))
cuotas  = int(input("Cantidad de cuotas mensuales: "))




tasa_mensual = tasa / 12
tea = (1 + tasa_mensual) ** 12 - 1


cuota = capital * (tasa_mensual * (1 + tasa_mensual) ** cuotas) / ((1 + tasa_mensual) ** cuotas - 1)


print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:.2f}")
print(f"Tasa periódica (TNA/12): {tasa_mensual * 100:.2f}%")
print(f"TEA (efectiva anual)   : {tea * 100:.2f}%")


print("\nCronograma de pagos:")
print(f"{'Mes':>10}{'Pago':>10}{'Capital':>10}{'Interés':>10}{'Saldo':>10}")
print("-" * 50)

saldo = capital
pago_total = capital_total = interes_total = 0

for mes in range(1, cuotas + 1):
    interes = saldo * tasa_mensual
    amortizacion = cuota - interes
    saldo -= amortizacion
    if saldo < 0:
        saldo = 0
    print(f"{mes:>10}{cuota:>10.2f}{amortizacion:>10.2f}{interes:>10.2f}{saldo:>10.2f}")
    pago_total += cuota
    capital_total += amortizacion
    interes_total += interes


print("\nTotales:")
print(f"  Pago   :  ${pago_total:,.2f}")
print(f"  Capital:  ${capital_total:,.2f}")
print(f"  Interés:  ${interes_total:,.2f}")
