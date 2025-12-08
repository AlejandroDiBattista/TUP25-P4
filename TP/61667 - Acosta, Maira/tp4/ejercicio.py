#TP4: Calculadora de prestamos - Sistema Francés

print("Calculadora de Amortización - Sistema Francés")
print("===Ingresar Datos del Prestamo===")

capital = float(input("- Monto inicial: "))
tasa    = float(input("- TNA: "))
cuotas  = int( input("- Cantidad de cuotas: "))
capital = float(input("- Monto inicial del prestamo: "))
tasa    = float(input("Tasa Nominal Anual(TNA): "))
cuotas  = int( input("- Cantidad de cuotas mensuales: "))

tasa_periodica= tasa/12
cuota = capital * (tasa_periodica * (1 + tasa_periodica) ** cuotas) / ((1 + tasa_periodica) ** cuotas - 1)
TEA = (1 + tasa_periodica) ** 12 - 1
print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12): {tasa_periodica * 100:10.2f}%")
print(f"TEA (efectiva anual)   : {TEA * 100:10.2f}%")
saldo = capital
tabla = []

print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  :"))
tasa    = float(input("Tasa Nominal Anual (TNA)    :"))
cuotas  = int( input("Cantidad de cuotas mensuales:"))
for mes in range(1, cuotas + 1):
    interes = saldo * tasa_periodica
    amortizacion = cuota - interes
    saldo -= amortizacion
    if saldo < 0: 
        saldo = 0
    tabla.append((mes, cuota, amortizacion, interes, saldo))

## === Realizar los calculos ===
print("\nCronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-" * 55)

# Calcular las cuotas mensuales y la tasa periódica
# Mostrar los resultados en el formato pedido
for mes, pago, capital_pagado, interes_pagado, saldo_restante in tabla:
    print(f"{mes:10d} {pago:10.2f} {capital_pagado:10.2f} {interes_pagado:10.2f} {saldo_restante:10.2f}")

pago_total = sum(fila[1] for fila in tabla)
capital_total = sum(fila[2] for fila in tabla)
interes_total = sum(fila[3] for fila in tabla)
print("Totales:")
print(f"  Pago   :  ${pago_total:,.2f}")
print(f"  Capital:  ${capital_total:,.2f}")
print(f"  Interés:  ${interes_total:,.2f}")
