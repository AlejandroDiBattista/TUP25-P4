# TP4: Calculadora de Amortización (Sistema Francés)

## Objetivo
Desarrollar un programa de consola en Python que calcule y muestre la tabla de amortización bajo el sistema francés.

## Requerimientos
- Solicitar al usuario, por consola, los siguientes datos:
  1. Monto inicial del préstamo (principal).
  2. Tasa Nominal Anual (TNA) expresada como número decimal (ej.: `0.7` equivale a `70 %`).
  3. Cantidad de cuotas mensuales.
- Calcular y mostrar:
  - La cuota fija mensual.
  - La tasa periódica (TNA/12).
  - La Tasa Efectiva Anual (TEA).
- Generar una tabla con tantas filas como cuotas, donde cada columna tenga un ancho fijo de 10 caracteres y los valores numéricos se muestren con dos decimales. La tabla debe incluir:
  - Número de cuota (Mes).
  - Pago mensual.
  - Capital amortizado.
  - Interés pagado.
  - Saldo restante después del pago.
- Mostrar los totales de Pago, Capital e Interés al final de la salida.

## Recomendaciones de desarrollo
1. Pedir los tres valores utilizando `input()`.
2. Calcular la cuota fija usando la fórmula del sistema francés.
3. Construir la tabla amortizando mes a mes y almacenando los registros en una lista de diccionarios (o similar) antes de imprimir.
4. Formatear la salida con `f-strings` para respetar el ancho fijo de 10 caracteres y dos decimales.
5. Al finalizar, sumar los pagos, capitales e intereses para mostrar los totales.

## Ejemplo de ejecución
Para verificar tu programa, probalo con los siguientes datos:


- Monto inicial: `10000`
- TNA: `0.7`
- Cantidad de cuotas: `20`

La salida esperada es:

```
=== Ingresar datos del préstamo ===
Monto inicial del préstamo  : 10000
Tasa Nominal Anual (TNA)    : 0.7
Cantidad de cuotas mensuales: 20  

=== Resultados ===
Cuota fija (mensual)    : $860.09
Tasa periódica (TNA/12):    5.83%
TEA (efectiva anual)   :   97.46%

Cronograma de pagos:
   Mes        Pago     Capital    Interés     Saldo   
---------- ---------- ---------- ---------- ----------
         1     860.09     276.75     583.33    9723.25
         2     860.09     292.90     567.19    9430.35
         3     860.09     309.98     550.10    9120.37
         4     860.09     328.07     532.02    8792.30
         5     860.09     347.20     512.88    8445.10
         6     860.09     367.46     492.63    8077.64
         7     860.09     388.89     471.20    7688.75
         8     860.09     411.58     448.51    7277.18
         9     860.09     435.58     424.50    6841.59
        10     860.09     460.99     399.09    6380.60
        11     860.09     487.88     372.20    5892.71
        12     860.09     516.34     343.74    5376.37
        13     860.09     546.46     313.62    4829.90
        14     860.09     578.34     281.74    4251.56
        15     860.09     612.08     248.01    3639.48
        16     860.09     647.78     212.30    2991.70
        17     860.09     685.57     174.52    2306.13
        18     860.09     725.56     134.52    1580.57
        19     860.09     767.89      92.20     812.68
        20     860.09     812.68      47.41       0.00

Totales:
  Pago   : $17,201.80
  Capital:  $9,999.98
  Interés:  $7,201.71
```

Nota: 
- Para el cálculo de la cuota fija, usar la fórmula: `Cuota = P * (i * (1 + i) ** n) / ((1 + i) ** n - 1)`, donde `P` es el monto del préstamo, `i` es la tasa periódica y `n` es el número total de cuotas.

- Para el cálculo de la TEA, usar la fórmula: `TEA = (1 + i) ** n - 1`, donde `i` es la tasa periódica y `n` es el número de períodos en un año (12 para mensual).

## Entrega

El programa debe ser entregado hasta el **lunes 13 de Octubre a las 20:59**