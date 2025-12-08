from decimal import Decimal, ROUND_HALF_UP

COL_WIDTH = 10
CENT = Decimal("0.01")


def redondear_centavos(valor):
    return Decimal(str(valor)).quantize(CENT, rounding=ROUND_HALF_UP)


def solicitar_float(prompt):
    while True:
        try:
            valor = float(input(prompt))
            if valor <= 0:
                print("El valor debe ser mayor que cero. Intente nuevamente.")
                continue
            return valor
        except ValueError:
            print("Entrada invalida. Intente nuevamente.")


def solicitar_int(prompt):
    while True:
        try:
            valor = int(input(prompt))
            if valor <= 0:
                print("El valor debe ser un entero positivo. Intente nuevamente.")
                continue
            return valor
        except ValueError:
            print("Entrada invalida. Intente nuevamente.")


def calcular_cuota(principal, tasa_periodica, cuotas):
    if tasa_periodica == 0:
        return principal / cuotas
    factor = (1 + tasa_periodica) ** cuotas
    return principal * (tasa_periodica * factor) / (factor - 1)


def generar_cronograma(principal, tasa_periodica, cuotas, cuota):
    saldo = principal
    cronograma = []
    for mes in range(1, cuotas + 1):
        interes = saldo * tasa_periodica
        capital = cuota - interes
        if capital > saldo:
            capital = saldo
            interes = cuota - capital
        saldo -= capital
        if saldo < 1e-6:
            saldo = 0.0
        cronograma.append({
            "mes": mes,
            "pago": cuota,
            "capital": capital,
            "interes": interes,
            "saldo": saldo,
        })
    return cronograma


def imprimir_cronograma(cronograma):
    encabezados = ["Mes", "Pago", "Capital", "Interes", "Saldo"]
    print("Cronograma de pagos:")
    print(" ".join(f"{titulo:>{COL_WIDTH}}" for titulo in encabezados))
    print(" ".join("-" * COL_WIDTH for _ in encabezados))
    for fila in cronograma:
        print(" ".join([
            f"{fila['mes']:>{COL_WIDTH}}",
            f"{fila['pago']:>{COL_WIDTH}.2f}",
            f"{fila['capital']:>{COL_WIDTH}.2f}",
            f"{fila['interes']:>{COL_WIDTH}.2f}",
            f"{fila['saldo']:>{COL_WIDTH}.2f}",
        ]))


def mostrar_totales(cronograma):
    total_pago = sum(redondear_centavos(fila["pago"]) for fila in cronograma)
    total_capital = sum(redondear_centavos(fila["capital"]) for fila in cronograma)
    total_interes = sum(redondear_centavos(fila["interes"]) for fila in cronograma)
    print("\nTotales:")
    print(f"  Pago   : ${total_pago:,.2f}")
    print(f"  Capital: ${total_capital:,.2f}")
    print(f"  Interes: ${total_interes:,.2f}")


def main():
    print("=== Ingresar datos del prestamo ===")
    principal = solicitar_float("Monto inicial del prestamo  : ")
    tna = solicitar_float("Tasa Nominal Anual (TNA)    : ")
    cuotas = solicitar_int("Cantidad de cuotas mensuales: ")

    tasa_periodica = tna / 12
    tea = (1 + tasa_periodica) ** 12 - 1
    cuota = calcular_cuota(principal, tasa_periodica, cuotas)

    print("\n=== Resultados ===")
    print(f"Cuota fija (mensual)    : ${cuota:,.2f}")
    print(f"Tasa periodica (TNA/12): {tasa_periodica * 100:10.2f}%")
    print(f"TEA (efectiva anual)   : {tea * 100:10.2f}%")

    cronograma = generar_cronograma(principal, tasa_periodica, cuotas, cuota)
    print()
    imprimir_cronograma(cronograma)
    mostrar_totales(cronograma)


if __name__ == "__main__":
    main()
