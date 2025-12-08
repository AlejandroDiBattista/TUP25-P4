#TP4: Calculadora de prestamos - Sistema Francés

def calcular_cuota_fija(monto, tasa_periodica, cuotas):
    """Calcula la cuota fija mensual usando el sistema francés"""
    factor = (tasa_periodica * (1 + tasa_periodica) ** cuotas) / ((1 + tasa_periodica) ** cuotas - 1)
    return monto * factor

def calcular_tea(tasa_periodica):
    """Calcula la Tasa Efectiva Anual"""
    return (1 + tasa_periodica) ** 12 - 1

def generar_tabla_amortizacion(monto, tasa_periodica, cuotas, cuota_fija):
    """Genera la tabla de amortización mes a mes"""
    tabla = []
    saldo = monto
    pago_total = 0
    capital_total = 0
    interes_total = 0
    
    for mes in range(1, cuotas + 1):
        interes = saldo * tasa_periodica
        capital = cuota_fija - interes
        saldo = saldo - capital
        
        # Ajustar el saldo final para evitar -0.00
        if abs(saldo) < 0.01:
            saldo = 0.00
            
        registro = {
            'mes': mes,
            'pago': cuota_fija,
            'capital': capital,
            'interes': interes,
            'saldo': saldo
        }
        
        tabla.append(registro)
        pago_total += cuota_fija
        capital_total += capital
        interes_total += interes
    
    return tabla, pago_total, capital_total, interes_total

def imprimir_tabla(tabla):
    """Imprime la tabla de amortización con formato"""
    print("\nCronograma de pagos:")
    print("   Mes        Pago     Capital    Interés     Saldo   ")
    print("-" * 50)
    
    for registro in tabla:
        print(f"{registro['mes']:>10d} {registro['pago']:>10.2f} {registro['capital']:>10.2f}"
              f" {registro['interes']:>10.2f} {registro['saldo']:>10.2f}")

def main():
    print("\n=== Ingresar datos del préstamo ===")
    try:
        capital = float(input("Monto inicial del préstamo  : "))
        tasa = float(input("Tasa Nominal Anual (TNA)    : "))
        cuotas = int(input("Cantidad de cuotas mensuales: "))

        if capital <= 0 or tasa <= 0 or cuotas <= 0:
            raise ValueError("Todos los valores deben ser positivos")

        # Calcular valores base
        tasa_periodica = tasa / 12
        tea = calcular_tea(tasa_periodica)
        cuota_fija = calcular_cuota_fija(capital, tasa_periodica, cuotas)

        # Mostrar resultados iniciales
        print("\n=== Resultados ===")
        print(f"Cuota fija (mensual)    : ${cuota_fija:,.2f}")
        print(f"Tasa periódica (TNA/12) : {tasa_periodica*100:>7.2f}%")
        print(f"TEA (efectiva anual)    : {tea*100:>7.2f}%")

        # Generar y mostrar tabla de amortización
        tabla, pago_total, capital_total, interes_total = generar_tabla_amortizacion(
            capital, tasa_periodica, cuotas, cuota_fija)
        imprimir_tabla(tabla)

        # Mostrar totales
        print("\nTotales:")
        print(f"  Pago   : ${pago_total:,.2f}")
        print(f"  Capital: ${capital_total:,.2f}")
        print(f"  Interés: ${interes_total:,.2f}")

    except ValueError as e:
        print(f"\nError: {e}")
        return

if __name__ == "__main__":
    main()
