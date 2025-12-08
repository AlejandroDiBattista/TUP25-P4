#TP4: Calculadora de prestamos - Sistema Francés

print("Calculadora de Amortización - Sistema Francés")

print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  : "))
raw_tasa    = float(input("Tasa Nominal Anual (TNA)    : ").strip())
cuotas  = int( input("Cantidad de cuotas mensuales: "))

if raw_tasa > 1:
    tasa = raw_tasa / 100.0
else:
    tasa = raw_tasa

i = tasa / 12

if i == 0:
    cuota = capital / cuotas
else:
    cuota = capital * (i * (1 + i) ** cuotas) / ((1 + i) ** cuotas - 1)

TEA = (1 + i) ** 12 - 1

print("\n=== Resultados ===")
print(f"Cuota fija (mensual)     : ${cuota:,.2f}")
print(f"Tasa Periódica (TNA/12)  : {i*100:.2f}%")
print(f"Tasa Efectiva Anual (TEA): {TEA*100:.2f}%\n")

saldo = capital
pago_total = 0
capital_total = 0
interes_total = 0

print(f"{'Mes':>5}{'Pago':>10}{'Capital':>10}{'Interés':>10}{'Saldo':>10}")
print("-" * 50)

for mes in range (1, cuotas + 1):
    interes = saldo * i
    amortizacion = cuota - interes
    saldo -= amortizacion

    if mes == cuotas:
        saldo = 0

    print(f"{mes:<10d}{cuota:<10.2f}{amortizacion:<10.2f}{interes:<10.2f}{saldo:<10.2f}")

    pago_total += cuota
    capital_total += amortizacion
    interes_total += interes



print("\nTotales:")
print(f"  Pago   :  ${pago_total:,.2f}")
print(f"  Capital:  ${capital_total:,.2f}")
print(f"  Interés:  ${interes_total:,.2f}")
