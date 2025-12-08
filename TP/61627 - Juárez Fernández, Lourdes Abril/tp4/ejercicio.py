"""TP4: Calculadora de prestamos - Sistema Francés

Programa de consola que solicita: monto, TNA (decimal) y cantidad de cuotas
y muestra la tabla de amortización (sistema francés), además de totales.

Se añadió un modo demo: ejecutar el script con el argumento "demo" para
probar con los datos del enunciado (capital=10000, TNA=0.7, cuotas=20).
"""

from __future__ import annotations
import sys


def calcular_amortizacion_frances(capital: float, tna: float, cuotas: int):
	"""Devuelve (cuota, tasa_periodica, tea, cronograma, totales)

	cronograma: lista de dicts con keys: mes, pago, capital, interes, saldo
	totales: dict con pago_total, capital_total, interes_total
	"""
	# tasa periodica mensual
	i = tna / 12.0

	# cuota fija (manejar caso i == 0)
	if abs(i) < 1e-12:
		cuota = capital / cuotas
	else:
		cuota = capital * (i * (1 + i) ** cuotas) / ((1 + i) ** cuotas - 1)

	# TEA (efectiva anual)
	tea = (1 + i) ** 12 - 1

	saldo = capital
	cronograma = []
	pago_total = 0.0
	capital_total = 0.0
	interes_total = 0.0

	for m in range(1, cuotas + 1):
		interes = saldo * i
		capital_amortizado = cuota - interes

		# En la última cuota, corregir posibles desviaciones por redondeo
		if m == cuotas:
			# ajustar capital amortizado para dejar saldo a 0
			capital_amortizado = saldo
			cuota = capital_amortizado + interes

		saldo = saldo - capital_amortizado

		# Redondear para mostrar y acumular totales consistentes con la tabla
		pago_r = round(cuota + 1e-12, 2)
		capital_r = round(capital_amortizado + 1e-12, 2)
		interes_r = round(interes + 1e-12, 2)
		saldo_r = round(max(saldo, 0.0) + 1e-12, 2)

		cronograma.append({
			'mes': m,
			'pago': pago_r,
			'capital': capital_r,
			'interes': interes_r,
			'saldo': saldo_r,
		})

		pago_total += pago_r
		capital_total += capital_r
		interes_total += interes_r

	totales = {
		'pago_total': pago_total,
		'capital_total': capital_total,
		'interes_total': interes_total,
	}

	return cuota, i, tea, cronograma, totales


def imprimir_tabla(capacidad_cronograma, cuota, tasa_periodica, tea):
	cronograma = capacidad_cronograma
	print('\n=== Resultados ===')
	print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
	print(f"Tasa periódica (TNA/12): {tasa_periodica*100:6.2f}%")
	print(f"TEA (efectiva anual)   : {tea*100:7.2f}%\n")

	print('Cronograma de pagos:')
	# encabezado
	print(f"{'Mes':>10}{'Pago':>10}{'Capital':>10}{'Interés':>10}{'Saldo':>10}")
	print('-' * 50)

	for r in cronograma:
		print(f"{r['mes']:10d}{r['pago']:10.2f}{r['capital']:10.2f}{r['interes']:10.2f}{r['saldo']:10.2f}")


def main():
	# Modo demo si se ejecuta con argumento 'demo'
	if len(sys.argv) > 1 and sys.argv[1].lower() == 'demo':
		print('=== Ingresar datos del préstamo ===')
		capital = 10000.0
		tna = 0.7
		cuotas = 20
		print(f"Monto inicial del préstamo  : {int(capital)}")
		print(f"Tasa Nominal Anual (TNA)    : {tna}")
		print(f"Cantidad de cuotas mensuales: {cuotas}  \n")
	else:
		print('=== Ingresar datos del préstamo ===')
		# pedir entradas al usuario
		try:
			capital = float(input('Monto inicial del préstamo  : '))
			tna = float(input('Tasa Nominal Anual (TNA)    : '))
			cuotas = int(input('Cantidad de cuotas mensuales: '))
		except Exception:
			print('Error: entradas inválidas. Asegúrese de ingresar números.')
			return

	cuota, tasa_periodica, tea, cronograma, totales = calcular_amortizacion_frances(capital, tna, cuotas)

	imprimir_tabla(cronograma, cuota, tasa_periodica, tea)

	print('\nTotales:')
	print(f"  Pago   : ${totales['pago_total']:,.2f}")
	print(f"  Capital: ${totales['capital_total']:,.2f}")
	print(f"  Interés: ${totales['interes_total']:,.2f}")


if __name__ == '__main__':
	main()
