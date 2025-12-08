# TP4: Calculadora de Amortización (Sistema Francés)
# Autor: Ahumada, Aiquen Osvaldo

def calcular_cuota_francesa(principal, tasa_periodica, num_cuotas):
    """
    Calcula la cuota fija mensual usando el sistema francés.
    Fórmula: Cuota = P * (i * (1 + i) ** n) / ((1 + i) ** n - 1)
    """
    if tasa_periodica == 0:
        return principal / num_cuotas
    
    factor = (1 + tasa_periodica) ** num_cuotas
    cuota = principal * (tasa_periodica * factor) / (factor - 1)
    return cuota


def calcular_tea(tasa_periodica, periodos_anio=12):
    """
    Calcula la Tasa Efectiva Anual (TEA).
    Fórmula: TEA = (1 + i) ** n - 1
    """
    return (1 + tasa_periodica) ** periodos_anio - 1


def generar_tabla_amortizacion(principal, tasa_periodica, num_cuotas, cuota_fija):
    """
    Genera la tabla de amortización completa.
    Retorna una lista de diccionarios con los datos de cada cuota.
    """
    tabla = []
    saldo = principal
    
    for mes in range(1, num_cuotas + 1):
        interes = saldo * tasa_periodica
        capital = cuota_fija - interes
        saldo = saldo - capital
        
        # Ajustar última cuota para evitar problemas de redondeo
        if mes == num_cuotas:
            capital += saldo
            saldo = 0.0
        
        tabla.append({
            'mes': mes,
            'pago': cuota_fija,
            'capital': capital,
            'interes': interes,
            'saldo': saldo
        })
    
    return tabla


def imprimir_tabla(tabla):
    """
    Imprime la tabla de amortización con formato fijo.
    """
    # Encabezado
    print("\nCronograma de pagos:")
    print(f"{'Mes':>10} {'Pago':>10} {'Capital':>10} {'Interés':>10} {'Saldo':>10}")
    print("-" * 10 + " " + "-" * 10 + " " + "-" * 10 + " " + "-" * 10 + " " + "-" * 10)
    
    # Filas de datos
    for fila in tabla:
        print(f"{fila['mes']:>10} {fila['pago']:>10.2f} {fila['capital']:>10.2f} "
              f"{fila['interes']:>10.2f} {fila['saldo']:>10.2f}")


def calcular_totales(tabla):
    """
    Calcula los totales de pago, capital e interés.
    """
    total_pago = sum(fila['pago'] for fila in tabla)
    total_capital = sum(fila['capital'] for fila in tabla)
    total_interes = sum(fila['interes'] for fila in tabla)
    
    return total_pago, total_capital, total_interes


def main():
    """
    Función principal que coordina la ejecución del programa.
    """
    print("=== Ingresar datos del préstamo ===")
    
    # Solicitar datos al usuario
    principal = float(input("Monto inicial del préstamo  : "))
    tna = float(input("Tasa Nominal Anual (TNA)    : "))
    num_cuotas = int(input("Cantidad de cuotas mensuales: "))
    
    # Calcular tasa periódica (mensual)
    tasa_periodica = tna / 12
    
    # Calcular cuota fija
    cuota_fija = calcular_cuota_francesa(principal, tasa_periodica, num_cuotas)
    
    # Calcular TEA
    tea = calcular_tea(tasa_periodica)
    
    # Mostrar resultados
    print("\n=== Resultados ===")
    print(f"Cuota fija (mensual)    : ${cuota_fija:.2f}")
    print(f"Tasa periódica (TNA/12): {tasa_periodica * 100:>7.2f}%")
    print(f"TEA (efectiva anual)   : {tea * 100:>7.2f}%")
    
    # Generar tabla de amortización
    tabla = generar_tabla_amortizacion(principal, tasa_periodica, num_cuotas, cuota_fija)
    
    # Imprimir tabla
    imprimir_tabla(tabla)
    
    # Calcular y mostrar totales
    total_pago, total_capital, total_interes = calcular_totales(tabla)
    
    print("\nTotales:")
    print(f"  Pago   : ${total_pago:,.2f}")
    print(f"  Capital: ${total_capital:,.2f}")
    print(f"  Interés: ${total_interes:,.2f}")


if __name__ == "__main__":
    main()
