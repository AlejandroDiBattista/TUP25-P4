
#!/usr/bin/env python3
# TP4: Calculadora de Amortización (Sistema Francés)

def main():
    print("=== Ingresar datos del préstamo ===")
    try:
        P = float(input("Monto inicial del préstamo  : ").strip())
        tna = float(input("Tasa Nominal Anual (TNA)    : ").strip())
        n = int(input("Cantidad de cuotas mensuales: ").strip())
    except ValueError:
        print("Error: ingresá números válidos (por ejemplo: 10000, 0.7, 20).")
        return

    if P <= 0 or n <= 0 or tna < 0:
        print("Error: monto y cuotas deben ser > 0; la TNA no puede ser negativa.")
        return

    # Tasa periódica mensual
    i = tna / 12.0

    # Cuota (Sistema Francés) con manejo de i=0
    if i == 0:
        cuota = P / n
    else:
        cuota = P * (i * (1 + i) ** n) / ((1 + i) ** n - 1)

    # TEA (12 periodos)
    tea = (1 + i) ** 12 - 1

    # Mostrar resultados
    print("\n=== Resultados ===")
    print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
    print(f"Tasa periódica (TNA/12): {i*100:8.2f}%")
    print(f"TEA (efectiva anual)   : {tea*100:8.2f}%")

    # Construcción de la tabla
    print("\nCronograma de pagos:")
    headers = ["Mes", "Pago", "Capital", "Interés", "Saldo"]
    print(" ".join(f"{h:>10}" for h in headers))
    print(" ".join("-"*10 for _ in headers))

    saldo = P
    registros = []
    total_pago = 0.0
    total_capital = 0.0
    total_interes = 0.0

    for mes in range(1, n + 1):
        if i == 0:
            interes = 0.0
        else:
            interes = saldo * i
        capital = cuota - interes

        # Ajuste en la última cuota para anular residuos por redondeo
        if mes == n:
            capital = saldo
            interes = cuota - capital
            saldo_nuevo = 0.0
        else:
            saldo_nuevo = saldo - capital

        registros.append({
            "mes": mes,
            "pago": cuota,
            "capital": capital,
            "interes": interes,
            "saldo": max(saldo_nuevo, 0.0)
        })

        total_pago += cuota
        total_capital += capital
        total_interes += interes
        saldo = saldo_nuevo

    # Impresión con ancho fijo (10) y 2 decimales
    for r in registros:
        print(f"{r['mes']:10d}"
              f"{r['pago']:10.2f}"
              f"{r['capital']:10.2f}"
              f"{r['interes']:10.2f}"
              f"{r['saldo']:10.2f}")

    print("\nTotales:")
    print(f"  Pago   : ${total_pago:,.2f}")
    print(f"  Capital: ${total_capital:,.2f}")
    print(f"  Interés: ${total_interes:,.2f}")


if __name__ == "__main__":
    main()
