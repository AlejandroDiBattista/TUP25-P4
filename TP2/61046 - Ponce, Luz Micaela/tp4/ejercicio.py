print("<<<<<<<<< INGRESAR DATOS DEL PRÉSTAO >>>>>>>>>")

p = float(input("Monto inicial del préstamo: "))
TNA = float(input("Tasa nominal anual (TNA): "))
n = int(input("Cantidad de cuotas mensuales: "))

i = TNA / 12
cuota = p * (i*(1+i)**n) / ((1+i)**n - 1)
TEA = (1 + i) ** 12 - 1

print("\n <<<<<<<<<< RESULTADOS >>>>>>>>>")
print(f"Cuota fija(mensual): ${cuota:.2f}")
print(f"Tasa periódica (TNA/12): {i * 100:8.2f}%")
print(f"TEA (efectiva anual): {TEA * 100:8.2f}%")

saldo = p
tabla = []

for mes in range(1, n + 1):
    interes = saldo * i
    capital = cuota - interes
    saldo -= capital
    if saldo < 0:
        saldo = 0
    tabla.append({
        "mes": mes,
        "pago": cuota,
        "capital": capital,
        "interes": interes,
        "saldo": saldo
    })

print("\n Cronograma de pagos: ")
print(f"{'Mes' :>10} {'Pago' :>10} {'Capital' :>10} {'Interés' :>10} {'Saldo' :>10}")
print("-" * 55)

for fila in tabla:
    print(f"{fila['mes']:10d} {fila['pago']:10.2f} {fila['capital']:10.2f} {fila['interes']:10.2f} {fila['saldo']:10.2f}")

total_pago = sum(f["pago"] for f in tabla)
total_capital = sum(f["capital"]  for f in tabla)
total_interes = sum(f["interes"] for f in tabla)

print("\n<<<<<TOTALES>>>>>>")
print(f"   Pago: ${total_pago:,.2f}")
print(f"   Capital: ${total_capital:,.2f}")
print(f"   Interés: ${total_interes:,.2f}")
