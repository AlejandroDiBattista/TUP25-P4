"""TP4: Calculadora de amortización utilizando el sistema francés."""

import math

print("=== Ingresar datos del préstamo ===")
principal = float(input("Monto inicial del préstamo  : "))
tna = float(input("Tasa Nominal Anual (TNA)    : "))
installments = int(input("Cantidad de cuotas mensuales: "))

periodic_rate = tna / 12

if math.isclose(periodic_rate, 0.0):
	quota = principal / installments
	tea = 0.0
else:
	quota = principal * (
		periodic_rate * (1 + periodic_rate) ** installments
	) / ((1 + periodic_rate) ** installments - 1)
	tea = (1 + periodic_rate) ** 12 - 1

print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${quota:,.2f}")
print(f"Tasa periódica (TNA/12): {periodic_rate * 100:8.2f}%")
print(f"TEA (efectiva anual)   : {tea * 100:9.2f}%")

print("\nCronograma de pagos:")
header = f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}"
separator = f"{'-' * 10} {'-' * 10} {'-' * 10} {'-' * 10} {'-' * 10}"
print(header)
print(separator)

# Recorremos cada cuota y construimos el cronograma de amortización.
balance = principal
total_payment = 0.0
total_principal = 0.0
total_interest = 0.0

for month in range(1, installments + 1):
	interest_payment = balance * periodic_rate
	principal_payment = quota - interest_payment
	new_balance = balance - principal_payment

	if month == installments or new_balance < 1e-2:
		principal_payment = balance
		quota_adjusted = principal_payment + interest_payment
		new_balance = 0.0
	else:
		quota_adjusted = quota

	total_payment += quota_adjusted
	total_principal += principal_payment
	total_interest += interest_payment

	print(
		f"{month:>10} "
		f"{quota_adjusted:>10.2f} "
		f"{principal_payment:>10.2f} "
		f"{interest_payment:>10.2f} "
		f"{new_balance:>10.2f}"
	)

	balance = new_balance

print("\nTotales:")
print(f"  Pago   : ${total_payment:,.2f}")
print(f"  Capital: ${total_principal:,.2f}")
print(f"  Interés: ${total_interest:,.2f}")
