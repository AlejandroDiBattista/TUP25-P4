def calcular_amortizacion():
    print("=== Ingresar datos del préstamo ===")
    P = float(input("Monto inicial del préstamo  : "))
    TNA = float(input("Tasa Nominal Anual (TNA)    : "))
    n = int(input("Cantidad de cuotas mensuales: "))

    # Cálculos principales
    i = TNA / 12  # tasa periódica mensual
    cuota = P * (i * (1 + i) ** n) / ((1 + i) ** n - 1)
    TEA = (1 + i) ** 12 - 1

    print("\n=== Resultados ===")
    print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
    print(f"Tasa periódica (TNA/12): {i * 100:8.2f}%")
    print(f"TEA (efectiva anual)   : {TEA * 100:8.2f}%\n")

    # Encabezado de la tabla
    print("Cronograma de pagos:")
    print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
    print("-" * 50)

    saldo = P
    total_pago = total_capital = total_interes = 0

    for mes in range(1, n + 1):
        interes = saldo * i
        capital = cuota - interes
        saldo -= capital

        total_pago += cuota
        total_capital += capital
        total_interes += interes

        print(f"{mes:10d} {cuota:10.2f} {capital:10.2f} {interes:10.2f} {saldo:10.2f}")

    print("\nTotales:")
    print(f"  Pago   : ${total_pago:,.2f}")
    print(f"  Capital: ${total_capital:,.2f}")
    print(f"  Interés: ${total_interes:,.2f}")

# Ejecutar el programa
if __name__ == "__main__":
    calcular_amortizacion()
