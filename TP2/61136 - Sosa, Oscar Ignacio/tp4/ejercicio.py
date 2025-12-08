# TP4: Calculadora de Amortización - Sistema Francés

# === Ingreso de datos ===
print("=== Ingresar datos del préstamo ===")
P = float(input("Monto inicial del préstamo  : "))
TNA = float(input("Tasa Nominal Anual (TNA)    : "))
n_cuotas = int(input("Cantidad de cuotas mensuales: "))

# === Cálculos preliminares ===
i = TNA / 12  # Tasa periódica mensual
cuota = P * (i * (1 + i) ** n_cuotas) / ((1 + i) ** n_cuotas - 1)
TEA = (1 + i) ** 12 - 1

# Mostrar resultados
print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12): {i*100:7.2f}%")
print(f"TEA (efectiva anual)   : {TEA*100:7.2f}%\n")

# === Tabla de amortización ===
print("Cronograma de pagos:")
print(f"{'Mes':>10}{'Pago':>10}{'Capital':>10}{'Interés':>10}{'Saldo':>10}")
print("-"*50)

saldo = P
total_pago = 0
total_capital = 0
total_interes = 0

for mes in range(1, n_cuotas + 1):
    interes = saldo * i
    capital = cuota - interes
    saldo -= capital
    if saldo < 1e-2:  # Evita decimales negativos residuales
        saldo = 0
    total_pago += cuota
    total_capital += capital
    total_interes += interes
    print(f"{mes:10d}{cuota:10.2f}{capital:10.2f}{interes:10.2f}{saldo:10.2f}")

# Totales
print("\nTotales:")
print(f"  Pago   : ${total_pago:,.2f}")
print(f"  Capital: ${total_capital:,.2f}")
print(f"  Interés: ${total_interes:,.2f}")
