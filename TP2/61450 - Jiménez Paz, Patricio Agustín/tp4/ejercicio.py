#TP4: Calculadora de prestamos - Sistema Francés

print("Calculadora de Amortización - Sistema Francés")

print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  : "))
tasa     = float(input("Tasa Nominal Anual (TNA)    : "))
cuotas  = int(input("Cantidad de cuotas mensuales: "))

## === Realizar los calculos ===
# tasa periódica mensual
i = tasa / 12

# cuota fija (sistema francés)
if i == 0:
	cuota = capital / cuotas
else:
	cuota = capital * (i * (1 + i) ** cuotas) / (((1 + i) ** cuotas) - 1)

# TEA (tasa efectiva anual)
tea = (1 + i) ** 12 - 1

# Construir cronograma mes a mes
saldo = capital
cronograma = []
for mes in range(1, cuotas + 1):
	interes = saldo * i
	amortizacion = cuota - interes
	# Evitar que por redondeos el último saldo quede negativo
	if mes == cuotas:
		amortizacion = saldo
		cuota = amortizacion + interes
		saldo = 0.0
	else:
		saldo = saldo - amortizacion

	cronograma.append({
		"mes": mes,
		"pago": cuota,
		"capital": amortizacion,
		"interes": interes,
		"saldo": saldo,
	})

# Totales
pago_total = sum(row["pago"] for row in cronograma)
capital_total = sum(row["capital"] for row in cronograma)
interes_total = sum(row["interes"] for row in cronograma)

## === Imprimir resultados ===
print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12): {i*100:7.2f}%")
print(f"TEA (efectiva anual)   : {tea*100:7.2f}%")

print("\nCronograma de pagos:")
# cabecera con ancho fijo de 10 por columna
print(f"{'Mes':>10}{'Pago':>10}{'Capital':>10}{'Interés':>10}{'Saldo':>10}")
print('-' * 50)
for row in cronograma:
	print(f"{row['mes']:10d}{row['pago']:10.2f}{row['capital']:10.2f}{row['interes']:10.2f}{row['saldo']:10.2f}")

print('\nTotales:')
print(f"  Pago   : ${pago_total:,.2f}")
print(f"  Capital:  ${capital_total:,.2f}")
print(f"  Interés:  ${interes_total:,.2f}")
