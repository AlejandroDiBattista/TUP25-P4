from decimal import Decimal, ROUND_HALF_UP

def calcular_amortizacion(principal: float, tna: float, cuotas: int):
    """
    Devuelve:
      - cuota_fija (Decimal, 2 decimales)
      - tasa_periodica (Decimal con alta precisión)
      - tea (Decimal con alta precisión)
      - filas: lista de dicts con mes, pago, capital, interes, saldo (todos Decimal con 2 decimales)
      - totales: dict con pago, capital, interes (sumas de redondeados, 2 decimales)
    """
    P = Decimal(str(principal))
    TNA = Decimal(str(tna))
    n = int(cuotas)


    i = (TNA / Decimal('12'))

    if i == 0:
        cuota = (P / Decimal(n))
    else:
        uno_mas_i_elev_n = (Decimal('1') + i) ** n
        cuota = P * (i * uno_mas_i_elev_n) / (uno_mas_i_elev_n - Decimal('1'))

   
    cuota_r = cuota.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    
    tea = (Decimal('1') + i) ** Decimal('12') - Decimal('1')

    filas = []
    saldo = P
    tot_pago = Decimal('0.00')
    tot_cap = Decimal('0.00')
    tot_int = Decimal('0.00')

    for mes in range(1, n + 1):
        interes = (saldo * i)
        interes_r = interes.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        capital = cuota_r - interes_r

        if mes == n:
            capital = saldo.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            interes_r = (cuota_r - capital).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        saldo = (saldo - capital)
        saldo_r = saldo.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        if mes == n:
            saldo_r = Decimal('0.00')

        filas.append({
            'mes': mes,
            'pago': cuota_r,
            'capital': capital,
            'interes': interes_r,
            'saldo': saldo_r
        })

        tot_pago += cuota_r
        tot_cap += capital
        tot_int += interes_r

    totales = {
        'pago': tot_pago.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
        'capital': tot_cap.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
        'interes': tot_int.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
    }
    return cuota_r, i, tea, filas, totales


def imprimir_tabla(principal: float, tna: float, cuotas: int):
    cuota_r, i, tea, filas, totales = calcular_amortizacion(principal, tna, cuotas)

    print("=== Ingresar datos del préstamo ===")
    print(f"Monto inicial del préstamo  : {int(principal) if principal.is_integer() else principal}")
    print(f"Tasa Nominal Anual (TNA)    : {tna}")
    print(f"Cantidad de cuotas mensuales: {cuotas}")
    print()
    print("=== Resultados ===")
    print(f"Cuota fija (mensual)    : ${cuota_r:.2f}")
    print(f"Tasa periódica (TNA/12): {float(i*100):8.2f}%")
    print(f"TEA (efectiva anual)   : {float(tea*100):8.2f}%")
    print()
    print("Cronograma de pagos:")
    headers = ("Mes", "Pago", "Capital", "Interés", "Saldo")
    print(f"{headers[0]:>10} {headers[1]:>10} {headers[2]:>10} {headers[3]:>10} {headers[4]:>10}")
    print(f"{'-'*10} {'-'*10} {'-'*10} {'-'*10} {'-'*10}")
    for f in filas:
        print(f"{f['mes']:10d} {f['pago']:10.2f} {f['capital']:10.2f} {f['interes']:10.2f} {f['saldo']:10.2f}")
    print()
    print("Totales:")
    print(f"  Pago   : ${totales['pago']:,}")
    print(f"  Capital: ${totales['capital']:,}")
    print(f"  Interés: ${totales['interes']:,}")


def main():
    print("=== Ingresar datos del préstamo ===")
    try:
        P = float(input("Monto inicial del préstamo  : ").strip())
        TNA = float(input("Tasa Nominal Anual (TNA)    : ").strip())
        n = int(input("Cantidad de cuotas mensuales: ").strip())
    except Exception:
        print("Entrada inválida. Asegúrate de ingresar números (TNA como decimal; ej.: 0.7 para 70%).")
        return

    print()
    imprimir_tabla(P, TNA, n)


if __name__ == "__main__":
    main()
