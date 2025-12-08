#TP4: Calculadora de prestamos - Sistema Francés

print("Calculadora de Amortización - Sistema Francés")

capital = float(input("- Monto inicial: "))
tasa    = float(input("- TNA: "))
cuotas  = int( input("- Cantidad de cuotas: "))


print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  :"))
tasa    = float(input("Tasa Nominal Anual (TNA)    :"))
cuotas  = int( input("Cantidad de cuotas mensuales:"))

## === Realizar los calculos ===

# Calcular las cuotas mensuales y la tasa periódica 
tasa_periodica = (tasa / 100) / 12

# Cálculo de la cuota fija (Sistema Francés)
cuota = capital * (tasa_periodica * (1 + tasa_periodica) ** cuotas) / ((1 + tasa_periodica) ** cuotas - 1)


# Cálculo de la TEA (Tasa Efectiva Anual)
TEA = (1 + tasa_periodica) ** 12 - 1



# Mostrar resultados iniciales
print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
print(f"Tasa periódica (TNA/12): {tasa_periodica * 100:8.2f}%")
print(f"TEA (efectiva anual)   : {TEA * 100:8.2f}%")

# Encabezado de la tabla
print("\nCronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-" * 50)

# Variables de acumulación
saldo = capital
pago_total = 0
capital_total = 0
interes_total = 0

# Generar tabla mes a mes
for mes in range(1, cuotas + 1):
    interes = saldo * tasa_periodica
    amortizacion = cuota - interes
    saldo -= amortizacion

    # Corrección por redondeo final
    if mes == cuotas:
        saldo = 0.0

    pago_total += cuota
    capital_total += amortizacion
    interes_total += interes

    print(f"{mes:10d}{cuota:10.2f}{amortizacion:10.2f}{interes:10.2f}{saldo:10.2f}")

print("Totales:")
print(f"  Pago   :  ${pago_total:,.2f}")
print(f"  Capital:  ${capital_total:,.2f}")
print(f"  Interés:  ${interes_total:,.2f}")
