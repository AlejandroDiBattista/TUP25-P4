#TP4: Calculadora de prestamos - Sistema Francés

print("Calculadora de Amortización - Sistema Francés")

print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  :"))
tasa    = float(input("Tasa Nominal Anual (TNA)    :"))
cuotas  = int( input("Cantidad de cuotas mensuales:"))

## === Realizar los calculos ===

# Calcular las cuotas mensuales y la tasa periódica (TNA/12)
# Tasa efectiva anual (TEA)
# Mostrar los resultados en el formato pedido

#calcular la tasa periodica
tasa_periodica = (tasa/12)

#calcular la cuota fija
cuota_fija_mensual = capital * (tasa_periodica * (1 + tasa_periodica) ** cuotas) / ((1 + tasa_periodica) ** cuotas - 1)

#calcular la TEA
tea_anual = (1 + tasa_periodica) ** 12 - 1

## === Mostrar los resultados ===
print("=== Resultados ===")
print(f"  Cuota fija (mensual)    : ${cuota_fija_mensual:,.2f}")
print(f"  Tasa periodica (TNA/12) : {tasa_periodica*100:8.2f}%")
print(f"  TEA (Efectiva Anual)    : {tea_anual*100:8.2f}%")


#Tabla Cronograma de pagos
print("=== Cronograma de pagos ===")

print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print(f"{'-'*10} {'-'*10} {'-'*10} {'-'*10} {'-'*10}")

#inicializar totales
total_pago =0.0
capital_total = 0.0
interes_total = 0.0
for mes in range (1,cuotas+1):
    interes = capital*tasa_periodica
    capital_pagado = cuota_fija_mensual - interes
    capital -= capital_pagado
    total_pago += cuota_fija_mensual
    capital_total += capital_pagado
    interes_total += interes
    

 
    print(f"{mes:10d} {cuota_fija_mensual:10.2f} {capital_pagado:10.2f} {interes:10.2f} {capital:10.2f}")




#totales de pago, capital e intereses
print("Totales:")
print(f"  Pago   :  ${total_pago:,.2f}")
print(f"  Capital:  ${capital_total:,.2f}")
print(f"  Interés:  ${interes_total:,.2f}")
