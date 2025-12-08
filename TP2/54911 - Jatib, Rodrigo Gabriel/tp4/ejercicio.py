"""
Ejercicio TP4 - Calculadora de Amortización (Sistema Francés)
"""

def main():
	print("=== Ingresar datos del préstamo ===")
	
	capital = float(input("Monto inicial del préstamo  : "))
	tasa = float(input("Tasa Nominal Anual (TNA)    : "))
	cuotas = int(input("Cantidad de cuotas mensuales: "))

	
	i = tasa / 12

	
	if i == 0:
		cuota = capital / cuotas
	else:
		cuota = capital * (i * (1 + i) ** cuotas) / ((1 + i) ** cuotas - 1)

	
	tea = (1 + i) ** 12 - 1

	
	print("\n=== Resultados ===")
	print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
	print(f"Tasa periódica (TNA/12): {i*100:7.2f}%")
	print(f"TEA (efectiva anual)   : {tea*100:7.2f}%")

	
	filas = []
	saldo = capital
	cuota_mensual = cuota

	for mes in range(1, cuotas + 1):
		interes = saldo * i
		capital = cuota_mensual - interes
		if mes == cuotas:
			capital = saldo
			pago = capital + interes
		else:
			pago = cuota_mensual
		saldo = saldo - capital

		
		pago_r = round(pago + 1e-12, 2)
		capital_r = round(capital + 1e-12, 2)
		interes_r = round(interes + 1e-12, 2)
		saldo_r = round(max(saldo, 0.0) + 1e-12, 2)

		filas.append({
			"mes": mes,
			"pago": pago_r,
			"capital": capital_r,
			"interes": interes_r,
			"saldo": saldo_r,
		})

	
	print("\nCronograma de pagos:")
	
	header = f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}"
	print(header)
	
	print(' '.join(['-' * 10] * 5))

	pago_total = 0.0
	capital_total = 0.0
	interes_total = 0.0

	for fila in filas:
		total_pago += fila['pago']
		total_capital += fila['capital']
		total_interes += fila['interes']
		
		print(f"{fila['mes']:10d} {fila['pago']:10.2f} {fila['capital']:10.2f} {fila['interes']:10.2f} {fila['saldo']:10.2f}")

	
	print("\nTotales:")
	print(f"  Pago   : ${pago_total:,.2f}")
	print(f"  Capital:  ${capital_total:,.2f}")
	print(f"  Interés:  ${interes_total:,.2f}")


if __name__ == '__main__':
	main()
