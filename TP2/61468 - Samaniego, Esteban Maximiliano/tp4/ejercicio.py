#TP4: Calculadora de prestamos - Sistema Francés

print("Calculadora de Amortización - Sistema Francés")

# Ingreso de datos (una sola vez)
capital = float(input("- Monto inicial: "))
tasa    = float(input("- TNA: "))
cuotas  = int( input("- Cantidad de cuotas: "))

# Eco de datos (no vuelve a pedirlos)
print("=== Ingresar datos del préstamo ===")
print(f"Monto inicial del préstamo  : {capital}")
print(f"Tasa Nominal Anual (TNA)    : {tasa}")
print(f"Cantidad de cuotas mensuales: {cuotas}")

## === Realizar los calculos ===

# Tasa periódica mensual (decimal)
i = tasa / 12.0

# Cuota fija (Sistema Francés)
if i == 0:
    cuota = capital / cuotas
else:
    cuota = capital * (i * (1 + i) ** cuotas) / ((1 + i) ** cuotas - 1)

# TEA
TEA = (1 + i) ** 12 - 1

# Mostrar resultados generales
print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:0.2f}")
print(f"Tasa periódica (TNA/12): {i*100:7.2f}%")
print(f"TEA (efectiva anual)   : {TEA*100:7.2f}%\n")

# Construcción del cronograma
saldo = capital
filas = []

def r2(x: float) -> float:
    return float(f"{x:.2f}")  # asegura 2 decimales al sumar totales mostrados

for mes in range(1, cuotas + 1):
    interes = saldo * i
    capital_amort = cuota - interes
    saldo = saldo - capital_amort

    # Evitar -0.00 visual
    if abs(saldo) < 0.005:
        saldo = 0.0

    filas.append({
        "mes": mes,
        "pago": r2(cuota),
        "cap": r2(capital_amort),
        "int": r2(interes),
        "saldo": r2(saldo)
    })

# Impresión tabulada con ancho fijo 10
print("Cronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print(f"{'-'*10} {'-'*10} {'-'*10} {'-'*10} {'-'*10}")
for f in filas:
    print(
        f"{f['mes']:>10}"
        f"{f['pago']:>10.2f}"
        f"{f['cap']:>10.2f}"
        f"{f['int']:>10.2f}"
        f"{f['saldo']:>10.2f}"
    )

# Totales (sumando lo mostrado, para coherencia con la tabla)
pago_total     = r2(sum(f['pago'] for f in filas))
capital_total  = r2(sum(f['cap']  for f in filas))
interes_total  = r2(sum(f['int']  for f in filas))

print("\nTotales:")
print(f"  Pago   :  ${pago_total:,.2f}")
print(f"  Capital:  ${capital_total:,.2f}")
print(f"  Interés:  ${interes_total:,.2f}")
