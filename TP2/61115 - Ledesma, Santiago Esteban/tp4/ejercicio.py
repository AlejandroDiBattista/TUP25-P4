# TP4: Calculadora de Amortización - Sistema Francés

print("Calculadora de Amortización - Sistema Francés")

print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  : "))
tna = float(input("Tasa Nominal Anual (TNA)    : "))
cuotas = int(input("Cantidad de cuotas mensuales: "))

# Cálculos
i = tna / 12  # tasa periódica mensual (ej: 0.7/12)
cuota = capital * (i * (1 + i) ** cuotas) / ((1 + i) ** cuotas - 1)
tea = (1 + i) ** 12 - 1

print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12):   {i*100:6.2f}%")
print(f"TEA (efectiva anual)   :   {tea*100:6.2f}%\n")

# Cronograma de pagos
tabla = []
saldo = capital
total_pago = 0
total_capital = 0
total_interes = 0

print("Cronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-"*50)
for mes in range(1, cuotas+1):
	interes = saldo * i
	capital_amortizado = cuota - interes
	saldo_restante = saldo - capital_amortizado
	if mes == cuotas:
		# Última cuota: ajustar saldo a cero por redondeo
		capital_amortizado += saldo_restante
		saldo_restante = 0.0
	tabla.append({
		"mes": mes,
		"pago": cuota,
		"capital": capital_amortizado,
		"interes": interes,
		"saldo": saldo_restante
	})
	total_pago += cuota
	total_capital += capital_amortizado
	total_interes += interes
	saldo = saldo_restante

for fila in tabla:
	print(f"{fila['mes']:10d} {fila['pago']:10.2f} {fila['capital']:10.2f} {fila['interes']:10.2f} {fila['saldo']:10.2f}")

print("\nTotales:")
print(f"  Pago   : ${total_pago:,.2f}")
print(f"  Capital: ${total_capital:,.2f}")
print(f"  Interés: ${total_interes:,.2f}")
