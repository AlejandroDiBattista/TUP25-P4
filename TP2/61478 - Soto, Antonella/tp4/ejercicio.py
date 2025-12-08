#TP4: Calculadora de prestamos - Sistema Francés

print("Calculadora de Amortización - Sistema Francés")

capital = float(input("- Monto inicial: "))
tasa    = float(input("- TNA: "))
cuotas  = int( input("- Cantidad de cuotas: "))


print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  : "))
tna     = float(input("Tasa Nominal Anual (TNA)    : "))
cuotas  = int(input("Cantidad de cuotas mensuales: "))

# Cálculos
tasa_periodica = tna / 12
i = tasa_periodica
n = cuotas
P = capital

# Cuota fija mensual (Sistema Francés)
cuota = P * (i * (1 + i) ** n) / ((1 + i) ** n - 1)

# TEA
TEA = (1 + i) ** 12 - 1

print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12):   {tasa_periodica*100:6.2f}%")
print(f"TEA (efectiva anual)   :   {TEA*100:6.2f}%\n")

# Cronograma de pagos
print("Cronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-"*50)

saldo = capital
tabla = []
total_pago = total_capital = total_interes = 0

for mes in range(1, cuotas+1):
    interes = saldo * i
    capital_amortizado = cuota - interes
    saldo -= capital_amortizado
    if saldo < 0.01: saldo = 0  # Evita decimales residuales
    tabla.append({
        "mes": mes,
        "pago": cuota,
        "capital": capital_amortizado,
        "interes": interes,
        "saldo": saldo
    })
    total_pago += cuota
    total_capital += capital_amortizado
    total_interes += interes

# Imprimir tabla
for fila in tabla:
    print(f"{fila['mes']:10d} {fila['pago']:10.2f} {fila['capital']:10.2f} {fila['interes']:10.2f} {fila['saldo']:10.2f}")

print("\nTotales:")
print(f"  Pago   : ${total_pago:,.2f}")
print(f"  Capital: ${total_capital:,.2f}")
print(f"  Interés: ${total_interes:,.2f}")
