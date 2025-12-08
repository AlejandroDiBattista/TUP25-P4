#!/usr/bin/env python3

# TP4: Calculadora de Amortización - Sistema Francés

import argparse


def main():
	parser = argparse.ArgumentParser(description='Calculadora de amortización - sistema francés')
	parser.add_argument('principal', nargs='?', type=float, help='Monto inicial del préstamo')
	parser.add_argument('tna', nargs='?', type=float, help='TNA como decimal (ej: 0.7 = 70%)')
	parser.add_argument('n_cuotas', nargs='?', type=int, help='Cantidad de cuotas mensuales')
	args = parser.parse_args()

	print("=== Ingresar datos del préstamo ===")
	# Pedir datos al usuario si no fueron pasados por línea de comandos
	if args.principal is None:
		principal = float(input("Monto inicial del préstamo  : ").strip())
	else:
		principal = args.principal

	if args.tna is None:
		tna = float(input("Tasa Nominal Anual (TNA)    : ").strip())
	else:
		tna = args.tna

	if args.n_cuotas is None:
		n_cuotas = int(input("Cantidad de cuotas mensuales: ").strip())
	else:
		n_cuotas = args.n_cuotas

	# Tasa periódica mensual
	i = tna / 12

	# Calcular cuota fija (sistema francés)
	if i == 0:
		cuota = principal / n_cuotas
	else:
		cuota = principal * (i * (1 + i) ** n_cuotas) / ((1 + i) ** n_cuotas - 1)

	# Para la impresión y la tabla usaremos la cuota redondeada a 2 decimales
	cuota_disp = round(cuota + 1e-12, 2)

	# Calcular TEA (usando i como tasa periódica mensual)
	tea = (1 + i) ** 12 - 1 if i != 0 else 0.0

	# Construir cronograma mes a mes guardando registros en una lista de diccionarios
	saldo = principal
	filas = []
	total_pago = 0.0
	total_capital = 0.0
	total_interes = 0.0

	for mes in range(1, n_cuotas + 1):
		# Interés del período sobre el saldo actual
		interes_raw = saldo * i
		# Redondeamos interés a 2 decimales para el registro
		interes = round(interes_raw + 1e-12, 2)

		# Capital amortizado en el período
		capital_amort = round(cuota_disp - interes, 2)

		# Ajuste en la última cuota para evitar saldos residuales por redondeo
		if mes == n_cuotas:
			# En la última cuota amortizamos todo lo que queda
			capital_amort = round(saldo + 1e-12, 2)
			# Recalcular interés como diferencia entre cuota (mostrada) y capital
			interes = round(cuota_disp - capital_amort, 2)

		# Nuevo saldo
		saldo = round(saldo - capital_amort, 2)

		# Acumular totales con valores redondeados (como se muestran)
		pago_mes = round(capital_amort + interes, 2)
		total_pago += pago_mes
		total_capital += capital_amort
		total_interes += interes

		filas.append({
			'mes': mes,
			'pago': pago_mes,
			'capital': capital_amort,
			'interes': interes,
			'saldo': saldo if saldo > 0 else 0.0,
		})

	# Imprimir resultados
	print('\n=== Resultados ===')
	print(f"Cuota fija (mensual)    : ${cuota_disp:,.2f}")
	print(f"Tasa periódica (TNA/12): {i*100:7.2f}%")
	print(f"TEA (efectiva anual)   : {tea*100:7.2f}%\n")

	print("Cronograma de pagos:")
	# Encabezados con ancho fijo de 10 caracteres
	print(f"{ 'Mes':>10}{'Pago':>10}{'Capital':>10}{'Interés':>10}{'Saldo':>10}")
	print(("---------- " * 5).strip())

	for r in filas:
		print(f"{r['mes']:10d}{r['pago']:10.2f}{r['capital']:10.2f}{r['interes']:10.2f}{r['saldo']:10.2f}")

	# Totales
	print('\nTotales:')
	print(f"  Pago   : ${total_pago:,.2f}")
	print(f"  Capital: ${total_capital:,.2f}")
	print(f"  Interés: ${total_interes:,.2f}")


if __name__ == '__main__':
	main()
