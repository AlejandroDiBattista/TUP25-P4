#TP4: Calculadora de prestamos - Sistema Francés


print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  : "))
tna = float(input("Tasa Nominal Anual (TNA)    : "))
cuotas = int(input("Cantidad de cuotas mensuales: "))

# Calcular tasa periódica y TEA
tasa_periodica = tna / 12
i = tasa_periodica
tea = (1 + i) ** 12 - 1

# Calcular cuota fija mensual (Sistema Francés)
if i == 0:
	cuota = capital / cuotas
else:
	cuota = capital * (i * (1 + i) ** cuotas) / ((1 + i) ** cuotas - 1)

print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12):   {tasa_periodica*100:6.2f}%")
print(f"TEA (efectiva anual)   :   {tea*100:6.2f}%\n")

print("Cronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-"*50)

saldo = capital
tabla = []
pago_total = 0
capital_total = 0
interes_total = 0

for mes in range(1, cuotas+1):
	interes = saldo * i
	capital_amortizado = cuota - interes
	saldo_restante = saldo - capital_amortizado
	if mes == cuotas:
		# Ajuste final para evitar decimales residuales
		capital_amortizado += saldo_restante
		saldo_restante = 0
	tabla.append({
		'mes': mes,
		'pago': cuota,
		'capital': capital_amortizado,
		'interes': interes,
		'saldo': saldo_restante
	})
	saldo = saldo_restante
	pago_total += cuota
	capital_total += capital_amortizado
	interes_total += interes

for fila in tabla:
	print(f"{fila['mes']:10d} {fila['pago']:10.2f} {fila['capital']:10.2f} {fila['interes']:10.2f} {fila['saldo']:10.2f}")

print("\nTotales:")
print(f"  Pago   : ${pago_total:,.2f}")
print(f"  Capital: ${capital_total:,.2f}")
print(f"  Interés: ${interes_total:,.2f}")
