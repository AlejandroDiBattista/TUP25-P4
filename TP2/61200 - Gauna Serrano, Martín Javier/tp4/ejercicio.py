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
# Mostrar los resultados en el formato pedido

print("Totales:")
print(f"  Pago   :  ${pago_total:,.2f}")
print(f"  Capital:  ${capital_total:,.2f}")
print(f"  Interés:  ${interes_total:,.2f}")
# ===============================================
# TP4: Calculadora de Amortización - Sistema Francés
# Lenguaje: Python
# Autor: [Tu nombre]
# Fecha: [fecha actual]
# ===============================================

def main():
    print("=== Ingresar datos del préstamo ===")
    monto = float(input("Monto inicial del préstamo  : "))
    tna = float(input("Tasa Nominal Anual (TNA)    : "))
    cuotas = int(input("Cantidad de cuotas mensuales: "))

    # ----------------------------------------------
    # Cálculos básicos
    tasa_periodica = tna / 12                   # Tasa mensual (en decimal)
    cuota = monto * (tasa_periodica * (1 + tasa_periodica) ** cuotas) / ((1 + tasa_periodica) ** cuotas - 1)
    tea = (1 + tasa_periodica) ** 12 - 1        # Tasa Efectiva Anual
    # ----------------------------------------------

    print("\n=== Resultados ===")
    print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
    print(f"Tasa periódica (TNA/12): {tasa_periodica * 100:8.2f}%")
    print(f"TEA (efectiva anual)   : {tea * 100:8.2f}%\n")

    # Encabezado de la tabla
    print("Cronograma de pagos:")
    print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
    print("-" * 50)

    saldo = monto
    total_pago = 0
    total_capital = 0
    total_interes = 0

    for mes in range(1, cuotas + 1):
        interes = saldo * tasa_periodica
        capital = cuota - interes
        saldo -= capital

        # Evitar error por redondeo en la última cuota
        if mes == cuotas:
            saldo = 0

        print(f"{mes:10d} {cuota:10.2f} {capital:10.2f} {interes:10.2f} {saldo:10.2f}")

        total_pago += cuota
        total_capital += capital
        total_interes += interes

    # Totales finales
    print("\nTotales:")
    print(f"  Pago   : ${total_pago:,.2f}")
    print(f"  Capital: ${total_capital:,.2f}")
    print(f"  Interés: ${total_interes:,.2f}")


# Punto de entrada del programa
if __name__ == "__main__":
    main()
