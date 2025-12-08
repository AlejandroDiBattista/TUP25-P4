#TP4: Calculadora de prestamos - Sistema Francés

print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  :"))
tasa    = float(input("Tasa Nominal Anual (TNA)    :"))
cuotas  = int( input("Cantidad de cuotas mensuales:"))

## === Realizar los calculos ===

# === Cálculos principales ===

# Tasa mensual (TNA / 12)
tasa_mensual = tasa / 12

# Tasa Efectiva Anual (TEA)
tea = (1 + tasa_mensual) ** 12 - 1

# Cálculo de la cuota fija mensual (fórmula del sistema francés)
cuota = capital * (tasa_mensual * (1 + tasa_mensual) ** cuotas) / ((1 + tasa_mensual) ** cuotas - 1)

# === Mostrar resultados iniciales ===
print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12): {tasa_mensual * 100:10.2f}%")
print(f"TEA (efectiva anual)   : {tea * 100:10.2f}%")

# === Generar tabla de amortización ===
print("\nCronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-" * 50)

saldo = capital
pago_total = capital_total = interes_total = 0

# Bucle principal para generar las cuotas
for mes in range(1, cuotas + 1):
    interes = saldo * tasa_mensual
    amortizacion = cuota - interes
    saldo -= amortizacion

    pago_total += cuota
    capital_total += amortizacion
    interes_total += interes

    # Formatear e imprimir cada fila
    print(f"{mes:10d} {cuota:10.2f} {amortizacion:10.2f} {interes:10.2f} {max(saldo, 0):10.2f}")

# Calcular las cuotas mensuales y la tasa periódica
# Mostrar los resultados en el formato pedido

print("Totales:")
print(f"  Pago   :  ${pago_total:,.2f}")
print(f"  Capital:  ${capital_total:,.2f}")
print(f"  Interés:  ${interes_total:,.2f}")

