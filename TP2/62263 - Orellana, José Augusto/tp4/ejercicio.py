import os

# Limpiar la consola
os.system('clear')

#TP4: Calculadora de prestamos - Sistema Francés

print("Calculadora de Amortización - Sistema Francés")

print("=== Ingresar datos del préstamo ===")
capital = float(input("Monto inicial del préstamo  : "))
tasa    = float(input("Tasa Nominal Anual (TNA)    : "))
cuotas  = int( input("Cantidad de cuotas mensuales: "))


## === Realizar los calculos ===

# Calcular las cuotas mensuales y la tasa periódica
tasa_periodica = tasa / 12
# Formula de la cuota: C = P * (i * (1 + i) ** n) / ((1 + i) ** n - 1)
numerador = tasa_periodica * (1 + tasa_periodica) ** cuotas
denominador = (1 + tasa_periodica) ** cuotas - 1
cuota_fija = capital * (numerador / denominador)

# Cálculo de la TEA
# Fórmula: TEA = (1 + i) ** 12 - 1
tea = (1 + tasa_periodica) ** 12 - 1

# Resultados
print("\n=== Resultados ===")
print(f"Cuota fija (mensual)   : ${cuota_fija:.2f}")
print(f"Tasa periódica (TNA/12): {tasa_periodica:.2%}")
print(f"TEA (efectiva anual)   : {tea:.2%}")

# Mostrar los resultados en el formato pedido
print("\nCronograma de pagos:")
print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
print("-" * 54)

saldo_restante = capital
interes_total = 0
capital_total = 0
tabla_de_pagos = []

# Bucle para generar y guardar los datos
for mes in range(1, cuotas + 1):
    # Se calcula el interés del mes sobre el saldo pendiente
    interes_del_mes = saldo_restante * tasa_periodica

    # Se calcula cuánto del pago va al capital
    capital_del_mes = cuota_fija - interes_del_mes

    # Se actualiza el saldo restante
    saldo_restante -= capital_del_mes

    ## Se crea un diccionario
    fila = {
        "mes": mes,
        "pago": cuota_fija,
        "capital": capital_del_mes,
        "interes": interes_del_mes,
        "saldo": saldo_restante
    }

    # Se añade el diccionario a la lista
    tabla_de_pagos.append(fila)

    # Se acumulan los totales para el final
    interes_total += interes_del_mes
    capital_total += capital_del_mes

# Bucle para imprimir
for fila in tabla_de_pagos:
    print(f"{fila['mes']:>10} {fila['pago']:>10.2f} {fila['capital']:>10.2f} {fila['interes']:>10.2f} {fila['saldo']:>10.2f}")

pago_total = capital_total + interes_total

print("\nTotales:")
print(f"  Pago   :  ${pago_total:,.2f}")
print(f"  Capital:  ${capital_total:,.2f}")
print(f"  Interés:  ${interes_total:,.2f}")