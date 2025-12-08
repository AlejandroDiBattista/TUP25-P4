# TP4: Calculadora de préstamos - Sistema Francés

print("=== Calculadora de Amortización - Sistema Francés ===")

# === Ingresar datos ===
capital = float(input("- Monto inicial del préstamo: "))
tasa    = float(input("- Tasa Nominal Anual (TNA, en decimal. Ej: 0.7 = 70%): "))
cuotas  = int(input("- Cantidad de cuotas mensuales: "))

# === Calcular ===
interes = tasa / 12  # tasa periódica mensual

if interes == 0:
    cuota = capital / cuotas
else:
    cuota = capital * (interes * (1 + interes) ** cuotas) / ((1 + interes) ** cuotas - 1)

cuota_red = round(cuota, 2)          # cuota mostrada/redondeada (860.09)
TEA = (1 + interes) ** 12 - 1

# === Mostrar resultados ===
print("\n=== Resultados ===")
print(f"Cuota fija (mensual)   : ${cuota_red:,.2f}")
print(f"Tasa periódica (TNA/12): {interes * 100:8.2f}%")
print(f"TEA (efectiva anual)   : {TEA * 100:8.2f}%\n")

# === Generar tabla de amortización ===
print("Cronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print(f"{'-'*10} {'-'*10} {'-'*10} {'-'*10} {'-'*10}")

saldo = capital

interes_total = 0.0
capital_total = 0.0

for mes in range(1, cuotas + 1):
    interes_mes_real  = saldo * interes
    capital_mes_real  = cuota - interes_mes_real
    saldo             = saldo - capital_mes_real

    interes_mes = round(interes_mes_real, 2)
    capital_mes = round(capital_mes_real, 2)
    saldo_mostrar = round(saldo, 2)

    interes_total += interes_mes
    capital_total += capital_mes

    print(f"{mes:10d} {cuota_red:10.2f} {capital_mes:10.2f} {interes_mes:10.2f} {saldo_mostrar:10.2f}")

# === Totales ===
pago_total = round(cuota_red * cuotas, 2)
interes_total = round(interes_total, 2)
capital_total = round(capital_total, 2)

print("\nTotales:")
print(f"  Pago   : ${pago_total:,.2f}")
print(f"  Capital: ${capital_total:,.2f}")
print(f"  Interés: ${interes_total:,.2f}")
