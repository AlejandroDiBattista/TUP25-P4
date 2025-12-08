# === Ingresar datos del préstamo ===
print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  : "))
tasa    = float(input("Tasa Nominal Anual (TNA)    : "))
cuotas  = int(input("Cantidad de cuotas mensuales: "))

# === Realizar los cálculos ===
# Calcular las cuotas mensuales, tasa periódica y TEA
tasa_mensual = tasa / 12 
cuota = capital * (tasa_mensual * (1 + tasa_mensual)**cuotas) / ((1 + tasa_mensual)**cuotas - 1)
TEA = (1 + tasa_mensual)**12 - 1

# === Mostrar tasas y resultados ===
print("\n=== Resultados ===")
print(f"Tasa periódica (TNA/12)   : {tasa_mensual*100:6.2f}%")
print(f"Tasa efectiva anual (TEA)  : {TEA*100:6.2f}%")
print(f"Cuota fija mensual         : ${cuota:,.2f}")

# --- Encabezados ---
print("\n=== Cronograma de pagos ===")
print(f"{'Mes':>8}{'Pago':>12}{'Capital':>12}{'Interés':>12}{'Saldo':>14}")
print("-" * 60)

# --- Inicializaciones ---
saldo = capital
pago_total = 0.0
capital_total = 0.0
interes_total = 0.0

# --- Bucle principal ---
for mes in range(1, cuotas + 1):
    interes = saldo * tasa_mensual
    capital_amort = cuota - interes

    # Ajuste de última cuota
    if mes == cuotas:
        capital_amort = saldo  
        cuota_efectiva = capital_amort + interes
    else:
        cuota_efectiva = cuota

    saldo -= capital_amort

    # Imprimir fila formateada
    print(f"{mes:>8}{cuota_efectiva:>12.2f}{capital_amort:>12.2f}{interes:>12.2f}{saldo:>14.2f}")

    # Acumular totales
    pago_total += cuota_efectiva
    capital_total += capital_amort
    interes_total += interes

# --- Mostrar totales ---
print("-" * 60)
print(f"{'Totales:':>8}{pago_total:>12.2f}{capital_total:>12.2f}{interes_total:>12.2f}{'':>14}")
print("\nResumen:")
print(f"  Pago total   : ${pago_total:,.2f}")
print(f"  Capital total: ${capital_total:,.2f}")
print(f"  Interés total: ${interes_total:,.2f}")
print("\n==============================================")
