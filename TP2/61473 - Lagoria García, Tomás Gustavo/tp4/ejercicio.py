#TP4: Calculadora de prestamos - Sistema Francés

print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  :"))
tasa    = float(input("Tasa Nominal Anual (TNA)    :"))
cuotas  = int( input("Cantidad de cuotas mensuales:"))

## === Realizar los calculos ===

# Calcular las cuotas mensuales y la tasa periódica
# Mostrar los resultados en el formato pedido
TasaP=tasa/12
CuotaF=capital*(TasaP*(1+TasaP)**cuotas)/((1+TasaP)**cuotas-1)
TEA=(1+TasaP)**12-1
print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${CuotaF:,.2f}")
print(f"Tasa periódica (TNA/12): {TasaP*100:10.2f}%")
print(f"TEA (efectiva anual)   : {TEA*100:10.2f}%")
tabla = []
Saldo = capital
pago_total = 0
capital_total = 0
interes_total = 0
for i in range(1, cuotas + 1):
    Interes = Saldo * TasaP
    Capital_pagado = CuotaF - Interes
    Saldo -= Capital_pagado
    pago_total += CuotaF
    capital_total += Capital_pagado
    interes_total += Interes
    tabla.append((i, CuotaF, Capital_pagado, Interes, Saldo if Saldo > 0 else 0))

# Mostrar la tabla
print("\n=== Cronograma de pagos===")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-" * 50)
for fila in tabla:
 print(f"{fila[0]:>10} {fila[1]:>10,.2f} {fila[2]:>10,.2f} {fila[3]:>10,.2f} {fila[4]:>10,.2f}")
print("Totales:")
print(f"  Pago   :  ${pago_total:,.2f}")
print(f"  Capital:  ${capital_total:,.2f}")
print(f"  Interés:  ${interes_total:,.2f}")
