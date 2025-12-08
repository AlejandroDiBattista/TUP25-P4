# TP4: Calculadora de Amortización - Sistema Francés

print("Calculadora de Amortización - Sistema Francés")
print("=== Ingresar datos del préstamo ===")

P = float(input("Monto inicial del préstamo  : "))
TNA = float(input("Tasa Nominal Anual (TNA)    : "))
n = int(input("Cantidad de cuotas mensuales: "))

i = TNA / 12                
TEA = (1 + i) ** 12 - 1     
cuota = P * (i * (1 + i) ** n) / ((1 + i) ** n - 1)  

print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12):   {i*100:,.2f}%")
print(f"TEA (efectiva anual)   :   {TEA*100:,.2f}%")

print("\nCronograma de pagos:")
print(f"{'Mes':>10}{'Pago':>10}{'Capital':>10}{'Interés':>10}{'Saldo':>10}")
print("-" * 50)

saldo = P
total_pago = 0
total_capital = 0
total_interes = 0

for mes in range(1, n + 1):
    interes = saldo * i
    capital = cuota - interes
    saldo -= capital

    total_pago += cuota
    total_capital += capital
    total_interes += interes

    print(f"{mes:10}{cuota:10.2f}{capital:10.2f}{interes:10.2f}{saldo:10.2f}")

print("\nTotales:")
print(f"  Pago   : ${total_pago:,.2f}")
print(f"  Capital: ${total_capital:,.2f}")
print(f"  Interés: ${total_interes:,.2f}")