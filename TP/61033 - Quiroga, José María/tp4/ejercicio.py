print("=== Ingresar datos del préstamo ===")
P = float(input("Monto inicial del préstamo  : "))
TNA = float(input("Tasa Nominal Anual (TNA en %) : "))
n = int(input("Cantidad de cuotas mensuales  : "))

i = (TNA / 100) / 12  
cuota = P * (i * (1 + i) ** n) / ((1 + i) ** n - 1)
TEA = (1 + i) ** 12 - 1

print("\n=== Resultados ===")
print(f"Cuota fija (mensual)     : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12)  : {i*100:8.2f}%")
print(f"TEA (efectiva anual)     : {TEA*100:8.2f}%\n")

print("Cronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-" * 55)

saldo = P
total_pago = total_capital = total_interes = 0

for mes in range(1, n + 1):
    interes = saldo * i
    capital = cuota - interes
    saldo -= capital
    if mes == n:  # Ajuste final por redondeo
        capital += saldo
        cuota += saldo
        saldo = 0
    total_pago += cuota
    total_capital += capital
    total_interes += interes
    print(f"{mes:10d} {cuota:10.2f} {capital:10.2f} {interes:10.2f} {saldo:10.2f}")

print("\nTotales:")
print(f"  Pago total   : ${total_pago:,.2f}")
print(f"  Capital total: ${total_capital:,.2f}")
print(f"  Interés total: ${total_interes:,.2f}")
