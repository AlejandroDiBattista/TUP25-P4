# TP4: Calculadora de Amortización - Sistema Francés

print("=== Calculadora de Amortización - Sistema Francés ===\n")

# === Solicitar datos por consola ===
while True:
    try:
        principal = float(input("Monto inicial del préstamo: "))
        if principal <= 0:
            print("El monto debe ser mayor a 0. Intente nuevamente.")
            continue
        break
    except ValueError:
        print("Ingrese un número válido.")

while True:
    try:
        tna = float(input("Tasa Nominal Anual (TNA) como decimal (ej: 0.7 para 70%): "))
        if tna <= 0:
            print("La tasa debe ser mayor a 0. Intente nuevamente.")
            continue
        break
    except ValueError:
        print("Ingrese un número válido.")

while True:
    try:
        n = int(input("Cantidad de cuotas mensuales: "))
        if n <= 0:
            print("La cantidad de cuotas debe ser mayor a 0. Intente nuevamente.")
            continue
        break
    except ValueError:
        print("Ingrese un número entero válido.")


i = tna / 12  # Tasa periódica mensual
tea = (1 + i) ** 12 - 1  # Tasa Efectiva Anual


cuota = principal * (i * (1 + i) ** n) / ((1 + i) ** n - 1)


print(f"\nTasa periódica mensual: {i:.6f}")
print(f"TEA (Tasa Efectiva Anual): {tea:.6f}")
print(f"Cuota fija mensual: ${cuota:.2f}\n")

# === tabla de amortización ===
tabla = []
saldo = principal
total_pago = 0
total_capital = 0
total_interes = 0

for mes in range(1, n + 1):
    interes_mes = saldo * i
    capital_mes = cuota - interes_mes
    saldo = saldo - capital_mes
    
    # Ajuste para el último mes para que saldo sea exactamente 0
    if mes == n:
        capital_mes = capital_mes + saldo
        saldo = 0
    
    fila = {
        'mes': mes,
        'pago': cuota,
        'capital': capital_mes,
        'interes': interes_mes,
        'saldo': saldo
    }
    tabla.append(fila)
    
    
    total_pago += cuota
    total_capital += capital_mes
    total_interes += interes_mes

# === Mostrar tabla ===
print("Cronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-" * 10 + " " + "-" * 10 + " " + "-" * 10 + " " + "-" * 10 + " " + "-" * 10)

for fila in tabla:
    print(f"{fila['mes']:>10} {fila['pago']:>10.2f} {fila['capital']:>10.2f} {fila['interes']:>10.2f} {fila['saldo']:>10.2f}")

# === Mostrar totales ===
print("\nTotales:")
print(f"  Pago   : ${total_pago:,.2f}")
print(f"  Capital: ${total_capital:,.2f}")
print(f"  Interés: ${total_interes:,.2f}")
