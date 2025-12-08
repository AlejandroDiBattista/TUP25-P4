# TP4: Calculadora de prestamos - Sistema Francés

print("Calculadora de Amortización - Sistema Francés")

print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  : "))
tasa = float(input("Tasa Nominal Anual (TNA)    : "))
cuotas = int(input("Cantidad de cuotas mensuales: "))

tasa_periodica = tasa / 12
tea = (1 + tasa_periodica) ** 12 - 1
cuota = capital * (tasa_periodica * (1 + tasa_periodica) ** cuotas) / ((1 + tasa_periodica) ** cuotas - 1)

print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12): {tasa_periodica * 100:8.2f}%")
print(f"TEA (efectiva anual)   : {tea * 100:8.2f}%")

print("\nCronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-" * 50)

saldo = capital
tabla = []

for mes in range(1, cuotas + 1):
    interes = saldo * tasa_periodica
    amortizacion = cuota - interes
    saldo -= amortizacion
    if saldo < 0:
        saldo = 0
    tabla.append({
        "mes": mes,
        "pago": cuota,
        "capital": amortizacion,
        "interes": interes,
        "saldo": saldo
    })
    print(f"{mes:10d} {cuota:10.2f} {amortizacion:10.2f} {interes:10.2f} {saldo:10.2f}")

pago_total = sum(x["pago"] for x in tabla)
capital_total = sum(x["capital"] for x in tabla)
interes_total = sum(x["interes"] for x in tabla)

print("\nTotales:")
print(f"  Pago   : ${pago_total:,.2f}")
print(f"  Capital: ${capital_total:,.2f}")
print(f"  Interés: ${interes_total:,.2f}")
