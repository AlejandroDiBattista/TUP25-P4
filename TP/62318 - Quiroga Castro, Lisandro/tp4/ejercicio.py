# TP4 - Calculadora de Amortización (Sistema Francés)

import math

print("=== Ingresar datos del préstamo ===")
P = float(input("Monto inicial del préstamo  : "))
TNA = float(input("Tasa Nominal Anual (TNA)    : "))
n = int(input("Cantidad de cuotas mensuales: "))

# --- Cálculos principales ---
i = TNA / 12                         # tasa periódica
cuota = P * (i * (1 + i)**n) / ((1 + i)**n - 1)   # cuota fija
TEA = (1 + i)**12 - 1                # Tasa Efectiva Anual

print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12): {i*100:8.2f}%")
print(f"TEA (efectiva anual)   : {TEA*100:8.2f}%\n")

# --- Encabezado tabla ---
print("Cronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-"*50)

saldo = P
tabla = []

total_pago = 0
total_cap = 0
total_int = 0

for mes in range(1, n + 1):
    interes = saldo * i
    capital = cuota - interes
    saldo -= capital

    # Evitar errores de redondeo en la última cuota
    if mes == n:
        saldo = 0.0

    tabla.append({
        "mes": mes,
        "pago": cuota,
        "capital": capital,
        "interes": interes,
        "saldo": saldo
    })

    total_pago += cuota
    total_cap += capital
    total_int += interes

    # imprimir fila
    print(
        f"{mes:10d}"
        f"{cuota:10.2f}"
        f"{capital:10.2f}"
        f"{interes:10.2f}"
        f"{saldo:10.2f}"
    )

# --- Totales ---
print("\nTotales:")
print(f"  Pago   : ${total_pago:,.2f}")
print(f"  Capital: ${total_cap:,.2f}")
print(f"  Interés: ${total_int:,.2f}")
