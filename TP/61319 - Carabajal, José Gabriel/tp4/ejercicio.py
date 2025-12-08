# TP4: Calculadora de Amortización - Sistema Francés

def calcular_cuota_frances(P: float, i: float, n: int) -> float:
    if i == 0:
        return P / n
    return P * (i * (1 + i) ** n) / ((1 + i) ** n - 1)

def generar_cronograma(P: float, i: float, n: int, cuota: float):
    saldo = P
    filas = []

    # Evitar que el ultimo saldo quede en -0.00 por redondeo
    eps = 1e-8

    for mes in range(1, n + 1):
        interes = saldo * i
        capital = cuota - interes

        # Ajuste final por redondeos: si se pasa, forzar a 0
        if capital > saldo:
            capital = saldo
            # Si se ajusta el capital, se ajusta tambien el pago de ese mes
            pago = capital + interes
        else:
            pago = cuota

        saldo = saldo - capital
        if abs(saldo) < eps:
            saldo = 0.0
        
        filas.append({
            "mes": mes,
            "pago": pago,
            "capital": capital,
            "interes": interes,
            "saldo": saldo
        })

    return filas

def imprimir_resultados(P: float, tna: float, n: int):
    # Tasa periódica y métricas
    i = tna / 12.0
    cuota = calcular_cuota_frances(P, i, n)
    tea = (1 + i) ** 12 - 1  # efectiva anual

    # Cronograma
    filas = generar_cronograma(P, i, n, cuota)

    # Totales (según lo mostrado)
    total_pago = sum(f["pago"] for f in filas)
    total_capital = sum(f["capital"] for f in filas)
    total_interes = sum(f["interes"] for f in filas)

    # Encabezado
    print("=== Ingresar datos del préstamo ===")
    print(f"Monto inicial del préstamo : {P:,.0f}".replace(",", "."))
    print(f"Tasa Nominal Anual (TNA)   : {tna}")
    print(f"Cantidad de cuotas mensuales: {n}")
    print()
    print("=== Resultados ===")
    # Muestro con dos decimales y ancho fijo como pide el enunciado
    print(f"Cuota fija (mensual) : ${cuota:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))
    print(f"Tasa periódica (TNA/12): {(i*100):.2f}%")
    print(f"TEA (efectiva anual)  : {(tea*100):.2f}%")
    print()
    print("Cronograma de pagos:")
    # Tabla con ancho fijo 10
    print(f'{"Mes":>10}{"Pago":>10}{"Capital":>10}{"Interés":>10}{"Saldo":>10}')
    print("-" * 50)
    for f in filas:
        # Formateo numérico con 2 decimales y ancho 10, usando coma para decimales en $:
        pago_str = f"{f['pago']:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
        cap_str = f"{f['capital']:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
        int_str = f"{f['interes']:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
        sal_str = f"{f['saldo']:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

        print(f"{f['mes']:>10}{pago_str:>10}{cap_str:>10}{int_str:>10}{sal_str:>10}")

    print()
    print("Totales:")
    tot_pago_str = f"${total_pago:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    tot_cap_str = f"${total_capital:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    tot_int_str = f"${total_interes:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    print(f"Pago:     {tot_pago_str}")
    print(f"Capital:  {tot_cap_str}")
    print(f"Interés:  {tot_int_str}")

def main():
    print("Calculadora de Amortización - Sistema Francés")
    print()
    # === Ingresar datos ===
    # El enunciado indica TNA como decimal (0.7 -> 70%)
    capital = float(input("- Monto inicial: "))
    tna = float(input("- TNA: "))
    cuotas = int(input("- Cantidad de cuotas: "))

    print()
    imprimir_resultados(capital, tna, cuotas)

if __name__ == "__main__":
    main()