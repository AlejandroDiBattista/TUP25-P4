# TP4: Calculadora de préstamos - Sistema Francés

print("Calculadora de Amortización - Sistema Francés")

#  Ingresar datos del préstamo
capital = float(input("Monto inicial del préstamo  : "))# Monto del préstamo
tasa = float(input("Tasa Nominal Anual (TNA)    : "))# TNA en decimal (ej. 0.7 para 70%)
cuotas = int(input("Cantidad de cuotas mensuales: "))

#  Calcular tasas y cuota fija 
tasa_periodica = tasa / 12  # tasa mensual
cuota_fija = capital * (tasa_periodica * (1 + tasa_periodica) ** cuotas) / ((1 + tasa_periodica) ** cuotas - 1)# fórmula de cuota fija del sistema francés
TEA = (1 + tasa_periodica) ** 12 - 1  # tasa efectiva anual

#  Mostrar resultados generales 
print("\n=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota_fija:,.2f}")#2f para formato decimal con 2 decimales
print(f"Tasa periódica (TNA/12): {tasa_periodica * 100:8.2f}%")#Tasa periódica es TNA/12 * 100 para mostrar en porcentaje y :8.2f para formato
print(f"TEA (efectiva anual)   : {TEA * 100:8.2f}%")#TEA es tasa efectiva anual * 100 para mostrar en porcentaje y :8.2f para formato

#  Encabezado de tabla 
print("\nCronograma de pagos:")
print(f"{'Mes':>10}{'Pago':>11}{'Capital':>11}{'Interés':>11}{'Saldo':>11}")
print("-" * 51) #51 guiones para separar encabezado de tabla

#  Variables iniciales 
saldo = capital
pago_total = 0
capital_total = 0
interes_total = 0

# Calcular amortización mes a mes 
for mes in range(1, cuotas + 1):
    interes = saldo * tasa_periodica
    amortizado = cuota_fija - interes
    saldo -= amortizado
    if saldo < 0: 
        saldo = 0  # evitar saldo negativo en el último pago

    print(f"{mes:10d}{cuota_fija:11.2f}{amortizado:11.2f}{interes:11.2f}{saldo:11.2f}")

    # acumular totales
    pago_total += cuota_fija
    capital_total += amortizado
    interes_total += interes

# === Totales ===
print("\nTotales:")
print(f"  Pago   :  ${pago_total:,.2f}")
print(f"  Capital:  ${capital_total:,.2f}")
print(f"  Interés:  ${interes_total:,.2f}")
