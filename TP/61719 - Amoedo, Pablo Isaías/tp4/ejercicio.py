# TP4: Calculadora de préstamos - Sistema Francés

print("=== Ingresar datos del préstamo ===")
capital_inicial = float(input("Monto inicial del préstamo  : "))
tna = float(input("Tasa Nominal Anual (TNA)    : "))
cuotas = int(input("Cantidad de cuotas mensuales: "))

# === Calculos ===
tasa_periodica = tna / 12
cuota = capital_inicial * (tasa_periodica * (1 + tasa_periodica) ** cuotas) / ((1 + tasa_periodica) ** cuotas - 1)
tea = (1 + tasa_periodica) ** 12 - 1

print("\n=== Resultados ===")
print(f"Cuota fija (mensual)   : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12): {tasa_periodica * 100:8.2f}%")
print(f"TEA (efectiva anual)   : {tea * 100:8.2f}%")

# === tabla de amortizacion ===
print("\nCronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-" * 50)

saldo = capital_inicial
pago_total = 0
capital_total = 0
interes_total = 0

for mes in range(1, cuotas + 1):
    interes = saldo * tasa_periodica
    capital_amortizado = cuota - interes
    saldo -= capital_amortizado
    if saldo < 0:
        saldo = 0  

    print(f"{mes:10d} {cuota:10.2f} {capital_amortizado:10.2f} {interes:10.2f} {saldo:10.2f}")

    pago_total += cuota
    capital_total += capital_amortizado
    interes_total += interes

# === totales ===
print("\nTotales:")
print(f"  Pago   : ${pago_total:,.2f}")
print(f"  Capital: ${capital_total:,.2f}")
print(f"  Interés: ${interes_total:,.2f}")

