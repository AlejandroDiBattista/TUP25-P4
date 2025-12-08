def calcular_amortizacion_frances():
    print("=== Ingresar datos del préstamo ===")
    P = float(input("Monto inicial del préstamo  : ").strip())
    TNA = float(input("Tasa Nominal Anual (TNA)    : ").strip())
    n = int(input("Cantidad de cuotas mensuales: ").strip())

    i = TNA / 12
    cuota = P * (i * (1 + i) ** n) / ((1 + i) ** n - 1) if i != 0 else P / n
    TEA = (1 + i) ** 12 - 1

    print("\n=== Resultados ===")
    print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
    print(f"Tasa periódica (TNA/12): {i*100:7.2f}%")
    print(f"TEA (efectiva anual)   : {TEA*100:7.2f}%\n")

    saldo = P
    filas = []
    total_pago = 0.0
    total_capital = 0.0
    total_interes = 0.0

    print("Cronograma de pagos:")
    print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
    print(" ".join(["-"*10]*5))

    for mes in range(1, n + 1):
        interes = saldo * i
        capital = cuota - interes
        if mes == n:
            capital = saldo
            interes = max(cuota - capital, 0.0)
        saldo = max(saldo - capital, 0.0)

        total_pago += (capital + interes)
        total_capital += capital
        total_interes += interes

        print(f"{mes:>10d} {capital+interes:>10.2f} {capital:>10.2f} {interes:>10.2f} {saldo:>10.2f}")

    print("\nTotales:")
    print(f"  Pago   : ${total_pago:,.2f}")
    print(f"  Capital: ${total_capital:,.2f}")
    print(f"  Interés: ${total_interes:,.2f}")

if __name__ == "__main__":
    calcular_amortizacion_frances()
