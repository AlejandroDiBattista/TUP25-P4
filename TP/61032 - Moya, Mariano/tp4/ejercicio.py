
print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  : "))
tna = float(input("Tasa Nominal Anual (TNA)    : "))
cuotas = int(input("Cantidad de cuotas mensuales: "))

# Cálculos
tasa_periodica = tna / 12
cuota = capital * (tasa_periodica * (1 + tasa_periodica) ** cuotas) / ((1 + tasa_periodica) ** cuotas - 1)
tea = (1 + tasa_periodica) ** 12 - 1

print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12):   {tasa_periodica*100:6.2f}%")
print(f"TEA (efectiva anual)   :   {tea*100:6.2f}%\n")

# Construir tabla de amortización
tabla = []
saldo = capital
total_pago = 0
total_capital = 0
total_interes = 0

print("Cronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-"*10 + " " + "-"*10 + " " + "-"*10 + " " + "-"*10 + " " + "-"*10)

for mes in range(1, cuotas+1):
	interes = saldo * tasa_periodica
	capital_amort = cuota - interes
	saldo_restante = saldo - capital_amort
	if saldo_restante < 1e-2:
		saldo_restante = 0.0
	print(f"{mes:10d} {cuota:10.2f} {capital_amort:10.2f} {interes:10.2f} {saldo_restante:10.2f}")
	total_pago += cuota
	total_capital += capital_amort
	total_interes += interes
	saldo = saldo_restante

print("\nTotales:")
print(f"  Pago   : ${total_pago:,.2f}")
print(f"  Capital: ${total_capital:,.2f}")
print(f"  Interés: ${total_interes:,.2f}")
