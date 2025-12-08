# TP4: Calculadora de Amortización (Sistema Francés)
# Autor: [Diaz Julieta Camila]
# Materia: Programación III - UTN
# -----------------------------------------------

# === Ingresar datos del préstamo ===
print("=== Ingresar datos del préstamo ===")
P = float(input("Monto inicial del préstamo  : "))
TNA = float(input("Tasa Nominal Anual (TNA)    : "))
n = int(input("Cantidad de cuotas mensuales: "))

# === Cálculos ===
i = TNA / 12               # tasa periódica mensual
cuota = P * (i * (1 + i) ** n) / ((1 + i) ** n - 1)
TEA = (1 + i) ** 12 - 1    # tasa efectiva anual

# === Mostrar resultados ===
print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12): {i*100:8.2f}%")
print(f"TEA (efectiva anual)   : {TEA*100:8.2f}%")

# === Generar tabla de amortización ===
saldo = P
tabla = []

for mes in range(1, n + 1):
    interes = saldo * i
    capital = cuota - interes
    saldo -= capital
    if saldo < 0:  # corregir por redondeo
        saldo = 0
    tabla.append({
        "mes": mes,
        "pago": cuota,
        "capital": capital,
        "interes": interes,
        "saldo": saldo
    })

# === Encabezado de tabla ===
print("\nCronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-" * 50)

# === Imprimir tabla ===
total_pago = total_capital = total_interes = 0

for fila in tabla:
    print(f"{fila['mes']:10d}"
          f"{fila['pago']:10.2f}"
          f"{fila['capital']:10.2f}"
          f"{fila['interes']:10.2f}"
          f"{fila['saldo']:10.2f}")
    total_pago += fila["pago"]
    total_capital += fila["capital"]
    total_interes += fila["interes"]

# === Totales ===
print("\nTotales:")
print(f"  Pago   : ${total_pago:,.2f}")
print(f"  Capital: ${total_capital:,.2f}")
print(f"  Interés: ${total_interes:,.2f}")
