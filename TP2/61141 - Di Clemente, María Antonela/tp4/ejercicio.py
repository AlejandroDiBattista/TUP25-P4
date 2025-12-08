#TP4: Calculadora de prestamos - Sistema Francés

print("Calculadora de Amortización - Sistema Francés")

capital = float(input("- Monto inicial: "))
tasa    = float(input("- TNA: "))
cuotas  = int( input("- Cantidad de cuotas: "))


print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  :"))
tasa    = float(input("Tasa Nominal Anual (TNA)    :"))
cuotas  = int( input("Cantidad de cuotas mensuales:"))

tasa_periodica = tasa / 12

cuota = capital * (tasa_periodica * (1 + tasa_periodica) ** cuotas) / ((1 + tasa_periodica) ** cuotas - 1)

tea = (1 + tasa_periodica) ** 12 - 1

print("=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12):   {tasa_periodica*100:6.2f}%")
print(f"TEA (efectiva anual)   :   {tea*100:6.2f}%")

print("Cronograma de pagos:")
print(f"{'Mes':>10}{'Pago':>10}{'Capital':>12}{'Interés':>12}{'Saldo':>12}")
print("-" * 56)

saldo = capital
pago_total = 0
capital_total = 0
interes_total = 0

for mes in range(1, cuotas + 1):
    interes = saldo * tasa_periodica
    amortizacion = cuota - interes
    saldo -= amortizacion
    if saldo < 0: 
        saldo = 0
    pago_total += cuota
    capital_total += amortizacion
    interes_total += interes

    print(f"{mes:10d}{cuota:10.2f}{amortizacion:12.2f}{interes:12.2f}{saldo:12.2f}")

print("\nTotales:")
print(f"  Pago   :  ${pago_total:,.2f}")
print(f"  Capital:  ${capital_total:,.2f}")
print(f"  Interés:  ${interes_total:,.2f}")
