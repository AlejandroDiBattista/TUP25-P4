print("=== Datos del préstamo ===")

# Ingreso de datos
prestamo = float(input("Monto del préstamo         : "))
tna = float(input("Tasa Nominal Anual (TNA %) : "))
cuotas = int(input("Número de cuotas mensuales  : "))

# Cálculos
tasa_mensual = (tna / 100) / 12
factor = (1 + tasa_mensual) ** cuotas
cuota = prestamo * tasa_mensual * factor / (factor - 1)
tea = (1 + tasa_mensual) ** 12 - 1

# Resultados generales
print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12): {tasa_mensual * 100:8.2f}%")
print(f"TEA (efectiva anual)   : {tea * 100:8.2f}%")

# Cronograma de pagos
saldo = prestamo
total_pago = total_capital = total_interes = 0

print("\nCronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-" * 50)

for mes in range(1, cuotas + 1):
    interes = saldo * tasa_mensual
    capital = cuota - interes
    saldo -= capital
    if saldo < 0:
        saldo = 0

    print(f"{mes:10d} {cuota:10.2f} {capital:10.2f} {interes:10.2f} {saldo:10.2f}")

    total_pago += cuota
    total_capital += capital
    total_interes += interes

# Totales
print("\nTotales:")
print(f"  Pago   : ${total_pago:,.2f}")
print(f"  Capital: ${total_capital:10,.2f}")
print(f"  Interés: ${total_interes:10,.2f}")
