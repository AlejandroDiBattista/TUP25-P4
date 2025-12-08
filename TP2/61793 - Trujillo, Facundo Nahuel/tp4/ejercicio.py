#TP4: Calculadora de prestamos - Sistema Francés

print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  : "))
tna     = float(input("Tasa Nominal Anual (TNA)    : "))
cuotas  = int( input("Cantidad de cuotas mensuales: "))

# Cálculos principales
tasa_periodica = tna / 12
cuota = capital * (tasa_periodica * (1 + tasa_periodica) ** cuotas) / ((1 + tasa_periodica) ** cuotas - 1)
tea = (1 + tasa_periodica) ** 12 - 1

print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12):   {tasa_periodica*100:6.2f}%")
print(f"TEA (efectiva anual)   :   {tea*100:6.2f}%\n")

# Construcción de la tabla de amortización
tabla = []
saldo = capital
pago_total = 0
capital_total = 0
interes_total = 0

print("Cronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-"*10 + " " + "-"*10 + " " + "-"*10 + " " + "-"*10 + " " + "-"*10)

for mes in range(1, cuotas+1):
    interes = saldo * tasa_periodica
    capital_amortizado = cuota - interes
    saldo -= capital_amortizado
    # Evitar saldo negativo por redondeo en la última cuota
    if mes == cuotas:
        capital_amortizado += saldo
        cuota += saldo
        saldo = 0.0
    pago_total += cuota
    capital_total += capital_amortizado
    interes_total += interes
    print(f"{mes:10d} {cuota:10.2f} {capital_amortizado:10.2f} {interes:10.2f} {saldo:10.2f}")

print("\nTotales:")
print(f"  Pago   : ${pago_total:,.2f}")
print(f"  Capital: ${capital_total:,.2f}")
print(f"  Interés: ${interes_total:,.2f}")
