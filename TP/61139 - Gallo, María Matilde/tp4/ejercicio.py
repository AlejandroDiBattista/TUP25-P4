def main():
    print("=== Ingresar datos del préstamo ===")
    P = float(input("Monto inicial del préstamo  : "))
    TNA = float(input("Tasa Nominal Anual (TNA)    : "))
    n = int(input("Cantidad de cuotas mensuales: "))

    # --- Cálculos ---
    i = TNA / 12                          # Tasa periódica mensual
    cuota = P * (i * (1 + i) ** n) / ((1 + i) ** n - 1)   # Cuota fija mensual
    TEA = (1 + i) ** 12 - 1               # Tasa efectiva anual

    print("\n=== Resultados ===")
    print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
    print(f"Tasa periódica (TNA/12): {i*100:8.2f}%")
    print(f"TEA (efectiva anual)   : {TEA*100:8.2f}%")

    # --- Construcción de la tabla ---
    saldo = P
    tabla = []
    for mes in range(1, n + 1):
        interes = saldo * i
        capital = cuota - interes
        saldo -= capital
        if saldo < 0:
            saldo = 0
        tabla.append({
            "Mes": mes,
            "Pago": cuota,
            "Capital": capital,
            "Interes": interes,
            "Saldo": saldo
        })

    # --- Impresión de la tabla ---
    print("\nCronograma de pagos:")
    print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
    print("-" * 50)
    for fila in tabla:
        print(f"{fila['Mes']:10d}{fila['Pago']:10.2f}{fila['Capital']:10.2f}{fila['Interes']:10.2f}{fila['Saldo']:10.2f}")

    # --- Totales ---
    total_pago = sum(f["Pago"] for f in tabla)
    total_capital = sum(f["Capital"] for f in tabla)
    total_interes = sum(f["Interes"] for f in tabla)

    print("\nTotales:")
    print(f"  Pago   : ${total_pago:,.2f}")
    print(f"  Capital: ${total_capital:,.2f}")
    print(f"  Interés: ${total_interes:,.2f}")


if __name__ == "__main__":
    main()
