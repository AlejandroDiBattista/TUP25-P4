# TP4: Calculadora de Amortización (Sistema Francés)

while True:
    try:
        capital = float(input("Monto inicial del préstamo: "))
        tna = float(input("Tasa Nominal Anual (TNA): "))
        cuotas = int(input("Cantidad de cuotas mensuales: "))
        if cuotas <= 0:
            raise ValueError
        break
    except:
        print("Entrada inválida. Volvé a intentar.\n")

if tna > 1:
    tna = tna / 100.0

i = tna / 12.0
if i == 0:
    cuota = capital / cuotas
else:
    f = (1 + i) ** cuotas
    cuota = capital * (i * f) / (f - 1)

tea = (1 + i) ** 12 - 1

print("\nResultados")
print(f"Cuota fija: ${cuota:,.2f}")
print(f"Tasa periódica (mensual): {i*100:.2f}%")
print(f"TEA: {tea*100:.2f}%\n")

print(f"{'Mes':>10}{'Pago':>10}{'Capital':>10}{'Interés':>10}{'Saldo':>10}")
print("-" * 50)

saldo = capital
total_pago = 0.0
total_cap = 0.0
total_int = 0.0

for n in range(1, cuotas + 1):
    interes = saldo * i
    amort = cuota - interes if i != 0 else cuota
    if n == cuotas:
        amort = saldo
        pago = amort + interes
    else:
        pago = cuota
    saldo -= amort
    total_pago += pago
    total_cap += amort
    total_int += interes
    print(f"{n:10d}{pago:10.2f}{amort:10.2f}{interes:10.2f}{max(saldo,0):10.2f}")

print("\nTotales:")
print(f"Pago total: ${total_pago:,.2f}")
print(f"Capital total: ${total_cap:,.2f}")
print(f"Interés total: ${total_int:,.2f}")
