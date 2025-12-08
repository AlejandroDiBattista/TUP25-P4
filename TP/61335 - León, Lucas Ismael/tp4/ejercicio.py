#TP4: Calculadora de prestamos - Sistema Francés

print("Calculadora de Amortización - Sistema Francés")

capital = float(input("- Monto inicial: "))
tasa    = float(input("- TNA: "))
cuotas  = int( input("- Cantidad de cuotas: "))


print("=== Ingresar datos del préstamo ===")
capital = capital
tasa    = tasa
cuotas  = cuotas

## === Realizar los calculos ===

i = tasa / 12

if i == 0:
	cuota = capital / cuotas
else:
	cuota = capital * (i * (1 + i) ** cuotas) / ((1 + i) ** cuotas - 1)

tea = (1 + i) ** 12 - 1

saldo = capital
cronograma = []
pago_total = 0.0
capital_total = 0.0
interes_total = 0.0

for mes in range(1, cuotas + 1):
	interes = saldo * i
	amortizacion = cuota - interes

	if mes == cuotas:
		amortizacion = saldo
		pago = amortizacion + interes
		saldo = 0.0
	else:
		pago = cuota
		saldo = saldo - amortizacion

	cronograma.append({
		"mes": mes,
		"pago": pago,
		"capital": amortizacion,
		"interes": interes,
		"saldo": saldo
	})

	pago_total += pago
	capital_total += amortizacion
	interes_total += interes

print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12):    {i * 100:5.2f}%")
print(f"TEA (efectiva anual)   :   {tea * 100:6.2f}%")

print("\nCronograma de pagos:")
print(f"{'Mes':>10}{'Pago':>10}{'Capital':>10}{'Interés':>10}{'Saldo':>10}")
print("" + ("-" * 10) + ("-" * 10) + ("-" * 10) + ("-" * 10) + ("-" * 10))

for r in cronograma:
	print(f"{r['mes']:10d}{r['pago']:10.2f}{r['capital']:10.2f}{r['interes']:10.2f}{r['saldo']:10.2f}")

print("\nTotales:")
print(f"  Pago   :  ${pago_total:,.2f}")
print(f"  Capital:  ${capital_total:,.2f}")
print(f"  Interés:  ${interes_total:,.2f}")
