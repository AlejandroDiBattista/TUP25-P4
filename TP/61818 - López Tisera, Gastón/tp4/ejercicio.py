# TP4: Calculadora de Amortización - Sistema Francés

print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  : "))
tna = float(input("Tasa Nominal Anual (TNA)    : "))
n_cuotas = int(input("Cantidad de cuotas mensuales: "))

# === Calcular variables del sistema francés ===
# Tasa periódica (mensual)
i = tna / 12

# Cuota fija mensual: P * (i * (1 + i)^n) / ((1 + i)^n - 1)
cuota_fija = capital * (i * (1 + i) ** n_cuotas) / ((1 + i) ** n_cuotas - 1)

# TEA: (1 + i)^12 - 1
tea = (1 + i) ** 12 - 1

# === Mostrar resultados ===
print()
print("=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota_fija:.2f}")
print(f"Tasa periódica (TNA/12): {i * 100:7.2f}%")
print(f"TEA (efectiva anual)   : {tea * 100:7.2f}%")
print()

# === Generar tabla de amortización ===
tabla = []
saldo = capital

for mes in range(1, n_cuotas + 1):
    interes = saldo * i
    capital_amortizado = cuota_fija - interes
    saldo = saldo - capital_amortizado
    
    # Evitar saldo negativo por redondeos
    if saldo < 0.01:
        saldo = 0
    
    tabla.append({
        'mes': mes,
        'pago': cuota_fija,
        'capital': capital_amortizado,
        'interes': interes,
        'saldo': saldo
    })

# === Imprimir tabla ===
print("Cronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-" * 10 + " " + "-" * 10 + " " + "-" * 10 + " " + "-" * 10 + " " + "-" * 10)

for fila in tabla:
    print(f"{fila['mes']:>10} {fila['pago']:>10.2f} {fila['capital']:>10.2f} {fila['interes']:>10.2f} {fila['saldo']:>10.2f}")

# === Totales ===
pago_total = sum(f['pago'] for f in tabla)
capital_total = sum(f['capital'] for f in tabla)
interes_total = sum(f['interes'] for f in tabla)

print()
print("Totales:")
print(f"  Pago   : ${pago_total:>10,.2f}")
print(f"  Capital: ${capital_total:>10,.2f}")
print(f"  Interés: ${interes_total:>10,.2f}")
