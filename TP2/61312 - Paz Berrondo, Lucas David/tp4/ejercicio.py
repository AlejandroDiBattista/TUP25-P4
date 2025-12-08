# TP4: Calculadora de Amortización (Sistema Francés)

import math

def calcular_prestamo_frances():
    """
    Calcula la tabla de amortización de un préstamo por el Sistema Francés,
    incluyendo la cuota fija, tasas y totales, e imprime la salida formateada.
    
    CORRECCIÓN: Se eliminó la doble solicitud de datos de entrada (input()).
    """
    print("Calculadora de Amortización - Sistema Francés")

    # === 1. Ingresar datos del préstamo ===
    
    # La estructura solicitada en el enunciado para la entrada de datos
    print("\n=== Ingresar datos del préstamo ===")
    
    try:
        # Se piden los datos una sola vez con los mensajes de la salida esperada.
        capital = float(input("Monto inicial del préstamo  :"))
        tasa_anual = float(input("Tasa Nominal Anual (TNA)    :"))
        cuotas = int(input("Cantidad de cuotas mensuales:"))
    except ValueError:
        print("Error: Por favor, ingrese valores numéricos válidos.")
        return
        
    # Validaciones básicas (opcional, pero recomendable)
    if capital <= 0 or tasa_anual < 0 or cuotas <= 0:
        print("Error: El monto, la tasa y la cantidad de cuotas deben ser mayores a cero.")
        return

    # === 2. Realizar los cálculos preliminares ===

    # Tasa periódica (mensual)
    tasa_mensual = tasa_anual / 12
    
    # Exponente para las fórmulas (1 + i)^n
    factor_potencia = (1 + tasa_mensual) ** cuotas
    
    # Cuota fija mensual - Fórmula del Sistema Francés
    # Cuota = P * (i * (1 + i) ** n) / ((1 + i) ** n - 1)
    if factor_potencia - 1 == 0:
        print("Error: La tasa periódica es cero, el cálculo no es posible con esta fórmula.")
        return
        
    cuota_fija_base = capital * (tasa_mensual * factor_potencia) / (factor_potencia - 1)
    
    # Tasa Efectiva Anual (TEA) - Fórmula: TEA = (1 + i) ** n - 1 (con n=12)
    tasa_efectiva_anual = (1 + tasa_mensual) ** 12 - 1

    # === 3. Generar la tabla de amortización ===
    
    # Inicialización de variables para la tabla y los totales
    saldo_restante = capital
    amortizacion_tabla = []
    pago_total = 0
    capital_total = 0
    interes_total = 0

    for mes in range(1, cuotas + 1):
        # Interés pagado: I = Saldo Anterior * Tasa periódica
        interes_pagado = saldo_restante * tasa_mensual
        
        # Capital amortizado: C = Cuota fija - Interés
        capital_amortizado = cuota_fija_base - interes_pagado
        
        # Nuevo saldo restante: S = Saldo Anterior - Capital amortizado
        # Usamos round() para evitar problemas de precisión con float.
        saldo_restante_nuevo = round(saldo_restante - capital_amortizado, 2)
        
        # Ajuste en la última cuota para asegurar Saldo = 0
        if mes == cuotas:
            # Forzar el capital amortizado para que el saldo sea 0
            capital_amortizado = saldo_restante 
            # Recalcular el interés de la última cuota con el saldo anterior
            interes_pagado = saldo_restante * tasa_mensual
            # La cuota de la última cuota debe ser Capital + Interés (para cerrar la cuenta)
            cuota_fija_ajustada = capital_amortizado + interes_pagado
            # Forzar el saldo a cero al final
            saldo_restante_nuevo = 0.00
            pago_cuota = cuota_fija_ajustada
        else:
            pago_cuota = cuota_fija_base

        # Almacenar el registro de la cuota
        amortizacion_tabla.append({
            "mes": mes,
            "pago": pago_cuota,
            "capital": capital_amortizado,
            "interes": interes_pagado,
            "saldo": saldo_restante_nuevo,
        })
        
        # Acumular los totales
        pago_total += pago_cuota
        capital_total += capital_amortizado
        interes_total += interes_pagado
        
        # Actualizar el saldo para la siguiente cuota
        saldo_restante = saldo_restante_nuevo

    # === 4. Mostrar Resultados ===
    
    print("\n=== Resultados ===")
    
    # Mostrar Cuota Fija, Tasa Periódica y TEA
    # Usamos la cuota base para mostrar el dato Cuota fija (mensual)
    print(f"Cuota fija (mensual)    : ${cuota_fija_base:,.2f}")
    print(f"Tasa periódica (TNA/12):    {tasa_mensual * 100:.2f}%")
    print(f"TEA (efectiva anual)   :   {tasa_efectiva_anual * 100:.2f}%")

    # Mostrar Encabezado de la tabla
    print("\nCronograma de pagos:")
    # Encabezados con ancho de 10
    print(" {:^10} {:^10} {:^10} {:^10} {:^10} ".format("Mes", "Pago", "Capital", "Interés", "Saldo"))
    print("-" * 10 + " " + "-" * 10 + " " + "-" * 10 + " " + "-" * 10 + " " + "-" * 10)
    
    # Mostrar Filas de la tabla
    for fila in amortizacion_tabla:
        # Formato: 10 caracteres de ancho, alineación derecha para números, 2 decimales
        print(f" {fila['mes']:>10.0f} {fila['pago']:>10.2f} {fila['capital']:>10.2f} {fila['interes']:>10.2f} {fila['saldo']:>10.2f}")

    # === 5. Mostrar Totales ===
    
    print("\nTotales:")
    # Nota: Los totales usan las sumas acumuladas que incluyen el ajuste de la última cuota.
    print(f"  Pago   : ${pago_total:,.2f}")
    print(f"  Capital:  ${capital_total:,.2f}")
    print(f"  Interés:  ${interes_total:,.2f}")

# Ejecutar la función principal
if __name__ == "__main__":
    calcular_prestamo_frances()