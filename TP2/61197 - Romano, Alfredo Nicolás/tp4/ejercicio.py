#TP4: Calculadora de prestamos - Sistema Francés

def leer_datos():
	print("=== Ingresar datos del préstamo ===")
	while True:
		try:
			P = float(input("Monto inicial del préstamo  : "))
			break
		except ValueError:
			print("Ingrese un número válido para el monto.")
	while True:
		try:
			TNA = float(input("Tasa Nominal Anual (TNA)    : "))
			break
		except ValueError:
			print("Ingrese un número válido para la tasa.")
	while True:
		try:
			n = int(input("Cantidad de cuotas mensuales: "))
			if n <= 0:
				print("La cantidad de cuotas debe ser mayor a 0.")
				continue
			break
		except ValueError:
			print("Ingrese un entero válido para la cantidad de cuotas.")
	return P, TNA, n


def cuota_sistema_frances(P, i, n):

	if i == 0:
		return P / n
	factor = (i * (1 + i) ** n) / ((1 + i) ** n - 1)
	return P * factor


def formatear_num(x):
	return f"{x:,.2f}"


def main():
	P, TNA, n_total = leer_datos()

	i = TNA / 12

	cuota = cuota_sistema_frances(P, i, n_total)

	TEA = (1 + i) ** 12 - 1

	saldo = P
	cronograma = []
	total_pago = 0.0
	total_capital = 0.0
	total_interes = 0.0

	for mes in range(1, n_total + 1):
		interes = saldo * i
		capital_amortizado = cuota - interes

		if mes == n_total:
			capital_amortizado = saldo
			cuota_pagada = saldo + interes
			saldo = 0.0
		else:
			cuota_pagada = cuota
			saldo = saldo - capital_amortizado

		cronograma.append({
			'mes': mes,
			'pago': cuota_pagada,
			'capital': capital_amortizado,
			'interes': interes,
			'saldo': saldo,
		})

		total_pago += cuota_pagada
		total_capital += capital_amortizado
		total_interes += interes


	print('\n=== Resultados ===')
	print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
	print(f"Tasa periódica (TNA/12):    {i*100:,.2f}%")
	print(f"TEA (efectiva anual)   :   {TEA*100:,.2f}%")

	print('\nCronograma de pagos:')

	print(f"{'Mes':>10}{'Pago':>10}{'Capital':>10}{'Interés':>10}{'Saldo':>10}")
	print('-' * 50)
	for r in cronograma:
		print(f"{r['mes']:>10}{r['pago']:10.2f}{r['capital']:10.2f}{r['interes']:10.2f}{r['saldo']:10.2f}")

	print('\nTotales:')
	print(f"  Pago   : ${total_pago:,.2f}")
	print(f"  Capital:  ${total_capital:,.2f}")
	print(f"  Interés:  ${total_interes:,.2f}")


if __name__ == '__main__':
	main()
