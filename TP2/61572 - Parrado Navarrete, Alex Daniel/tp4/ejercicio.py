# ============================================
#   Sistema de amortización francés en Python
# ============================================

print("=== Ingresar datos del préstamo ===")

# Solicitud de datos
monto = float(input("Monto inicial del préstamo  : "))
tna = float(input("Tasa Nominal Anual (TNA)    : "))
cuotas = int(input("Cantidad de cuotas mensuales: "))

# Cálculos
tasa_periodica = tna / 12
cuota = monto * (tasa_periodica * (1 + tasa_periodica) ** cuotas) / ((1 + tasa_periodica) ** cuotas - 1)
tea = (1 + tasa_periodica) ** 12 - 1

# Encabezado de resultados
print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12): {tasa_periodica * 100:8.2f}%")
print(f"TEA (efectiva anual)   : {tea * 100:8.2f}%")

# Generar cronograma de pagos
saldo = monto
tabla = []

for mes in range(1, cuotas + 1):
    interes = saldo * tasa_periodica
    capital = cuota - interes
    saldo -= capital
    if saldo < 0:
        saldo = 0
    tabla.append({
        "mes": mes,
        "pago": cuota,
        "capital": capital,
        "interes": interes,
        "saldo": saldo
    })

# Mostrar tabla
print("\nCronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-" * 50)

total_pago = 0
total_capital = 0
total_interes = 0

for fila in tabla:
    print(f"{fila['mes']:10d} "
          f"{fila['pago']:10.2f} "
          f"{fila['capital']:10.2f} "
          f"{fila['interes']:10.2f} "
          f"{fila['saldo']:10.2f}")
    total_pago += fila['pago']
    total_capital += fila['capital']
    total_interes += fila['interes']

# Totales finales
print("\nTotales:")
print(f"  Pago   : ${total_pago:,.2f}")
print(f"  Capital: ${total_capital:,.2f}")
print(f"  Interés: ${total_interes:,.2f}")
