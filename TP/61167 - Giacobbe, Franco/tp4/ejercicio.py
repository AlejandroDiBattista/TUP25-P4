import math

# --- Funciones auxiliares ---

def ingresar_datos():
    """Solicita y devuelve los datos del préstamo."""
    print("=== Ingresar datos del préstamo ===")
    principal = float(input("Monto inicial del préstamo  : "))
    tna = float(input("Tasa Nominal Anual (TNA)    : "))
    n_cuotas = int(input("Cantidad de cuotas mensuales: "))

    if principal <= 0 or tna <= 0 or n_cuotas <= 0:
        print("Error: Todos los valores deben ser positivos.")
        exit()

    return principal, tna, n_cuotas


def calcular_tasas(tna):
    """Calcula la tasa periódica y la TEA."""
    tasa_periodica = tna / 12
    tea = (1 + tasa_periodica) ** 12 - 1
    return tasa_periodica, tea


def calcular_cuota(principal, tasa_periodica, n_cuotas):
    """Calcula la cuota fija mensual del sistema francés."""
    numerador = tasa_periodica * (1 + tasa_periodica) ** n_cuotas
    denominador = (1 + tasa_periodica) ** n_cuotas - 1
    cuota_fija = principal * (numerador / denominador)
    return cuota_fija


def generar_cronograma(principal, tasa_periodica, n_cuotas, cuota_fija):
    """Genera e imprime la tabla de amortización."""
    saldo_restante = principal
    pago_total = 0.0
    capital_total = 0.0
    interes_total = 0.0
    tabla_amortizacion = []

    print("\nCronograma de pagos:")
    encabezado = "Mes".ljust(10) + "Pago".ljust(10) + "Capital".ljust(10) + "Interés".ljust(10) + "Saldo".ljust(10)
    separador = "-" * 10 + " " + "-" * 10 + " " + "-" * 10 + " " + "-" * 10 + " " + "-" * 10
    print(encabezado)
    print(separador)

    for mes in range(1, n_cuotas + 1):
        interes_pagado = saldo_restante * tasa_periodica
        capital_amortizado = cuota_fija - interes_pagado
        nuevo_saldo = saldo_restante - capital_amortizado

        if mes == n_cuotas:
            capital_amortizado = saldo_restante
            pago_ajustado = capital_amortizado + interes_pagado
            nuevo_saldo = 0.00
        else:
            pago_ajustado = cuota_fija

        saldo_restante = nuevo_saldo

        pago_total += pago_ajustado
        capital_total += capital_amortizado
        interes_total += interes_pagado

        fila = (
            f"{mes:<10d}"
            f"{pago_ajustado:10.2f}"
            f"{capital_amortizado:10.2f}"
            f"{interes_pagado:10.2f}"
            f"{saldo_restante:10.2f}"
        )
        print(fila)

        registro = {
            'Mes': mes,
            'Pago': pago_ajustado,
            'Capital': capital_amortizado,
            'Interés': interes_pagado,
            'Saldo': nuevo_saldo
        }
        tabla_amortizacion.append(registro)

    print("\nTotales:")
    print(f"  Pago   : ${pago_total:,.2f}")
    print(f"  Capital: ${capital_total:,.2f}")
    print(f"  Interés: ${interes_total:,.2f}")

    return tabla_amortizacion


# --- Función principal ---

def calculadora_amortizacion_frances():
    print("Calculadora de Amortización - Sistema Francés \n")

    principal, tna, n_cuotas = ingresar_datos()
    tasa_periodica, tea = calcular_tasas(tna)
    cuota_fija = calcular_cuota(principal, tasa_periodica, n_cuotas)

    print("\n=== Resultados ===")
    print(f"Cuota fija (mensual)   : ${cuota_fija:.2f}")
    print(f"Tasa periódica (TNA/12): {tasa_periodica * 100:.2f}%")
    print(f"TEA (efectiva anual)   : {tea * 100:.2f}%")

    generar_cronograma(principal, tasa_periodica, n_cuotas, cuota_fija)


# --- Ejecución ---
calculadora_amortizacion_frances()