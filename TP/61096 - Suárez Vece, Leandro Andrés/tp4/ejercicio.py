#TP4: Calculadora de prestamos - Sistema Francés

print("Calculadora de Amortización - Sistema Francés")

capital = float(input("- Monto inicial: "))
tasa    = float(input("- TNA: "))
cuotas  = int( input("- Cantidad de cuotas: "))

# capital = 10000
# tasa = 0.7
# cuotas = 20

# print("=== Ingresar datos del préstamo ===")
# capital = float(input("Monto inicial del préstamo  :"))
# tasa    = float(input("Tasa Nominal Anual (TNA)    :"))
# cuotas  = int( input("Cantidad de cuotas mensuales:"))

## === Realizar los calculos ===

tasa_periodica = tasa / 12 
cuota_fija = capital * (tasa_periodica * (1 + tasa_periodica) ** cuotas) / ((1 + tasa_periodica) ** cuotas - 1)
TEA =  ((1+ tasa_periodica) ** 12 -1) * 100

print(f"  cuota   :  ${cuota_fija:,.2f}")
print(f"  Tasa periódica  :  {tasa_periodica * 100 :,.2f}%")
print(f"  TEA  :  {TEA:,.2f}%")

# Calcular las cuotas mensuales y la tasa periódica
# Mostrar los resultados en el formato pedido

capital_total = 0
saldo_anterior = capital
print("Cronograma de pagos:")
print("Mes        Pago     Capital    Interés     Saldo  ")
for x in range(cuotas):
    interes = saldo_anterior * tasa_periodica
    capital_amortizado = cuota_fija - interes
    saldo_restante = saldo_anterior - capital_amortizado
    capital_total += capital_amortizado
    saldo_anterior = saldo_restante
    print(f"{x}        ${cuota_fija:,.2f}     {capital_amortizado:,.2f}    {interes:,.2f}     {saldo_restante:,.2f}  ")


pago_total = cuota_fija * 20
interes_total= pago_total - 10000


print("Totales:")
print(f"  Pago   :  ${pago_total:,.2f}")
print(f"  Capital:  ${capital_total:,.2f}")
print(f"  Interés:  ${interes_total:,.2f}")
