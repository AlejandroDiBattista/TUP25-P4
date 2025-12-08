# Calculadora de amortización (sistema francés) - consola

def solicitar_valores():
    print("=== Ingresar datos del préstamo ===")
    while True:
        try:
            p = float(input("Monto inicial del préstamo  : ").strip())
            break
        except ValueError:
            print("Valor inválido. Ingrese un número.")
    while True:
        try:
            tna = float(input("Tasa Nominal Anual (TNA)    : ").strip())
            break
        except ValueError:
            print("Valor inválido. Ingrese un número (ej.: 0.7 para 70%).")
    while True:
        try:
            n = int(input("Cantidad de cuotas mensuales: ").strip())
            if n <= 0:
                raise ValueError
            break
        except ValueError:
            print("Valor inválido. Ingrese un entero positivo.")
    return p, tna, n

def calcular_cuota_francesa(P, i, n):
    # i: tasa periódica (decimal)
    if i == 0:
        return P / n
    numer = P * i * (1 + i) ** n
    denom = (1 + i) ** n - 1
    return numer / denom

def generar_tabla(P, i, n, cuota):
    saldo = P
    filas = []
    total_pago = 0.0
    total_capital = 0.0
    total_interes = 0.0

    for mes in range(1, n + 1):
        interes = saldo * i
        capital = cuota - interes
        # proteger contra que el capital sea mayor que el saldo por errores de redondeo
        if capital > saldo:
            capital = saldo
            cuota_mes = capital + interes
        else:
            cuota_mes = cuota

        saldo = saldo - capital
        # corregir errores muy pequeños
        if abs(saldo) < 1e-8:
            saldo = 0.0

        filas.append({
            "mes": mes,
            "pago": cuota_mes,
            "capital": capital,
            "interes": interes,
            "saldo": saldo
        })

        total_pago += cuota_mes
        total_capital += capital
        total_interes += interes

    return filas, total_pago, total_capital, total_interes

def imprimir_resultados(P, tna, n, cuota, i_periodica, tea, filas, tot_pago, tot_cap, tot_int):
    print("\n=== Resultados ===")
    print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
    print(f"Tasa periódica (TNA/12): {i_periodica*100:6.2f}%")
    print(f"TEA (efectiva anual)   : {tea*100:7.2f}%\n")

    print("Cronograma de pagos:")
    # encabezado con ancho fijo 10 por columna
    print(f"{'Mes':>10}{'Pago':>11}{'Capital':>11}{'Interés':>11}{'Saldo':>11}")
    print(("-" * 10) + " " + ("-" * 10) + " " + ("-" * 10) + " " + ("-" * 10) + " " + ("-" * 10))
    for r in filas:
        print(f"{r['mes']:10d}{r['pago']:11.2f}{r['capital']:11.2f}{r['interes']:11.2f}{r['saldo']:11.2f}")

    print("\nTotales:")
    print(f"  Pago   : ${tot_pago:,.2f}")
    print(f"  Capital:  ${tot_cap:,.2f}")
    print(f"  Interés:  ${tot_int:,.2f}")

def main():
    P, tna, n = solicitar_valores()
    # mostrar datos ingresados
    print()
    print("=== Datos ingresados ===")
    print(f"Monto inicial del préstamo  : {int(P) if P.is_integer() else P}")
    print(f"Tasa Nominal Anual (TNA)    : {tna}")
    print(f"Cantidad de cuotas mensuales: {n}")

    # cálculo
    i_periodica = tna / 12.0
    cuota = calcular_cuota_francesa(P, i_periodica, n)
    tea = (1 + i_periodica) ** 12 - 1

    filas, tot_pago, tot_cap, tot_int = generar_tabla(P, i_periodica, n, cuota)

    imprimir_resultados(P, tna, n, cuota, i_periodica, tea, filas, tot_pago, tot_cap, tot_int)

if __name__ == "__main__":
    main()