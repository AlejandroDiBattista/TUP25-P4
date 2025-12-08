#TP4: Calculadora de prestamos - Sistema Francés

# Imprimir el título del programa
print("Calculadora de Amortización - Sistema Francés")

print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  :"))
tasa    = float(input("Tasa Nominal Anual (TNA)    :"))
cuotas  = int( input("Cantidad de cuotas mensuales:"))

tasa_periodica = tasa / 12
cuota_fija = capital * (tasa_periodica * (1 + tasa_periodica) ** cuotas) / ((1 + tasa_periodica) ** cuotas - 1)

tea = (1 + tasa_periodica) ** 12 - 1

print("=== Resultados ===")
print(f"Cuota fija (mensual)    : ${cuota_fija:.2f}")
print(f"Tasa periódica (TNA/12): {tasa_periodica*100:6.2f}%")
print(f"TEA (efectiva anual)   : {tea*100:6.2f}%")

print("\nCronograma de pagos:")
print("   Mes        Pago     Capital    Interés     Saldo   ")
print("---------- ---------- ---------- ---------- ----------")

amortizacion = []
saldo = capital


for mes in range(1, cuotas + 1):
    interes = saldo * tasa_periodica
    capital_amortizado = cuota_fija - interes
    saldo -= capital_amortizado
    amortizacion.append({
        'mes': mes,
        'pago': cuota_fija,
        'capital': capital_amortizado,
        'interes': interes,
        'saldo': saldo
    })

for registro in amortizacion:
    print(f"{registro['mes']:10} {registro['pago']:10.2f} {registro['capital']:10.2f} {registro['interes']:10.2f} {registro['saldo']:10.2f}")

total_pago = sum(registro['pago'] for registro in amortizacion)
total_capital = sum(registro['capital'] for registro in amortizacion)
total_interes = sum(registro['interes'] for registro in amortizacion)

print("\nTotales:")
print(f"  Pago   : ${total_pago:,.2f}")
print(f"  Capital: ${total_capital:,.2f}")
print(f"  Interés: ${total_interes:,.2f}")
