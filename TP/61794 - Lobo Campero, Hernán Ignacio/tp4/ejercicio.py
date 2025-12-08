#TP4: Calculadora de prestamos - Sistema Francés

print("Calculadora de Amortización - Sistema Francés")
print("=== Ingresar datos del prestamo ===")
principal = float(input("Monto inicial del prestamo  : "))
tna = float(input("Tasa Nominal Anual (TNA)    : "))
cantidad_cuotas = int(input("Cantidad de cuotas mensuales: "))

if cantidad_cuotas <= 0:
    raise ValueError("La cantidad de cuotas debe ser mayor a cero.")

tasa_periodica = tna / 12
if tasa_periodica == 0:
    cuota = principal / cantidad_cuotas
    tea = 0.0
else:
    cuota = principal * (tasa_periodica * (1 + tasa_periodica) ** cantidad_cuotas) / (
        (1 + tasa_periodica) ** cantidad_cuotas - 1
    )
    tea = (1 + tasa_periodica) ** 12 - 1

print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
print(f"Tasa periodica (TNA/12): {tasa_periodica * 100:8.2f}%")
print(f"TEA (efectiva anual)   : {tea * 100:8.2f}%")

print("\nCronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interes':>10} {'Saldo':>10}")
print(f"{'-' * 10} {'-' * 10} {'-' * 10} {'-' * 10} {'-' * 10}")

saldo = principal
total_pago = 0.0
total_capital = 0.0
total_interes = 0.0

for mes in range(1, cantidad_cuotas + 1):
    interes = saldo * tasa_periodica
    if tasa_periodica == 0:
        interes = 0.0
        pago = cuota
        capital = cuota
    else:
        pago = cuota
        capital = pago - interes

    if mes == cantidad_cuotas:
        capital = saldo
        pago = capital + interes

    saldo -= capital
    saldo = 0.0 if abs(saldo) < 1e-6 else saldo

    pago_mostrado = round(pago, 2)
    capital_mostrado = round(capital, 2)
    interes_mostrado = round(interes, 2)
    saldo_mostrado = round(max(saldo, 0.0), 2)

    total_pago += pago_mostrado
    total_capital += capital_mostrado
    total_interes += interes_mostrado

    print(
        f"{mes:10d} {pago_mostrado:10.2f} {capital_mostrado:10.2f} {interes_mostrado:10.2f} {saldo_mostrado:10.2f}"
    )

print("\nTotales:")
print(f"  Pago   : ${round(total_pago, 2):,.2f}")
print(f"  Capital: ${round(total_capital, 2):,.2f}")
print(f"  Interés: ${round(total_interes, 2):,.2f}")
