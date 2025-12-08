import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")

st.write("Escribir aca la solucion del TP5")st.write("Escribir aca la solucion del TP5") 
         # app.py
import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# -----------------------
# Configuración de la página
# -----------------------
st.set_page_config(page_title="Reporte de productos", layout="wide")

# -----------------------
# Barra lateral
# -----------------------
with st.sidebar:
    st.title("Configuración")
    uploaded_file = st.file_uploader(
        label="Seleccioná un CSV",
        type=["csv"],
        help="Subí un archivo CSV con las columnas: año, mes, producto, cantidad, ingreso, costo"
    )

    # Si se cargó archivo, intentamos leer y obtener años para el selectbox
    years = []
    if uploaded_file is not None:
        try:
            df_all = pd.read_csv(uploaded_file)
        except Exception as e:
            st.error(f"Error al leer el CSV: {e}")
            st.stop()

        # Normalizar nombres de columnas a minúsculas para seguridad
        df_all.columns = [c.strip().lower() for c in df_all.columns]

        # Validar que existan las columnas esperadas
        required_cols = {"año", "año".encode().decode() }  # dummy to avoid lint
        required_cols = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
        missing = required_cols - set(df_all.columns)
        if missing:
            st.error(f"El CSV no contiene las columnas obligatorias: {', '.join(sorted(missing))}")
            st.stop()

        # Obtener años disponibles ordenados
        try:
            years = sorted(df_all["año"].dropna().unique().tolist())
        except Exception:
            st.error("No se pudieron leer los valores de la columna 'año'. Asegurate que sean numéricos o cadenas representables.")
            st.stop()

    # Selector de año (se muestra aunque years = [] — si está vacío el selectbox mostrará sólo "Seleccioná un año")
    selected_year = None
    if years:
        # convertimos a list de strings para mostrar ordenado (si son numéricos quedan ordenados por sorted)
        years_display = [int(y) if (isinstance(y, (int, np.integer)) or (isinstance(y, float) and y.is_integer())) else y for y in years]
        years_display = sorted(years_display)
        selected_year = st.selectbox("Seleccioná un año", options=years_display)
    else:
        # si no hay años (o no se cargó archivo) dejamos el selectbox con instrucción
        st.selectbox("Seleccioná un año", options=["Seleccioná un año"])

# -----------------------
# Validaciones iniciales
# -----------------------
if uploaded_file is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

# A estas alturas df_all ya fue leído más arriba; asegurémonos de tenerlo
# (en caso de que el archivo sea grande y lo queramos recargar, lo hacemos de nuevo desde el BytesIO)
# Pero como ya lo leímos guardado en df_all, lo usamos.
df = df_all.copy()

# Normalizar columnas (asegurar nombres exactos en minúsculas)
df.columns = [c.strip().lower() for c in df.columns]

# Convertir tipos donde corresponda
# Intentamos convertir año y mes a enteros cuando sea posible
def safe_int_convert(series):
    try:
        return pd.to_numeric(series, errors="coerce").astype('Int64')
    except Exception:
        return series

df["año"] = safe_int_convert(df["año"])
df["mes"] = safe_int_convert(df["mes"])
df["cantidad"] = pd.to_numeric(df["cantidad"], errors="coerce").fillna(0)
df["ingreso"] = pd.to_numeric(df["ingreso"], errors="coerce").fillna(0.0)
df["costo"] = pd.to_numeric(df["costo"], errors="coerce").fillna(0.0)

# Validar año seleccionado
if selected_year is None:
    st.warning("Seleccioná un año en la barra lateral para continuar.")
    st.stop()

# Filtrar por año seleccionado
# Aceptamos que selected_year sea int o string
try:
    df_year = df[df["año"] == int(selected_year)].copy()
except Exception:
    # si no pudo convertir, comparo como string
    df_year = df[df["año"].astype(str) == str(selected_year)].copy()

if df_year.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

# -----------------------
# Encabezado principal
# -----------------------
st.markdown("# Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

# -----------------------
# Preparar datos: agrupar por producto y mes
# -----------------------
# Aseguramos que 'producto' esté en forma de string y limpiamos espacios
df_year["producto"] = df_year["producto"].astype(str).str.strip()

# Creamos agrupaciones por producto y mes
grouped = df_year.groupby(["producto", "mes"], as_index=False).agg({
    "cantidad": "sum",
    "ingreso": "sum",
    "costo": "sum"
})

# También necesitaremos totales por producto (para métricas de la columna izquierda)
totals = df_year.groupby("producto", as_index=False).agg({
    "cantidad": "sum",
    "ingreso": "sum",
    "costo": "sum"
})

# Orden alfabético de productos
productos = sorted(totals["producto"].unique().tolist(), key=lambda s: s.lower())

# Funciones de formato
def format_int_thousands(x):
    try:
        return f"{int(x):,}"
    except Exception:
        return f"{x}"

def format_money(x):
    try:
        return f"${x:,.2f}"
    except Exception:
        return f"${x}"

# Colores solicitados
COLOR_PRICE = "#1f77b4"  # azul
COLOR_COST = "#d62728"   # rojo

# -----------------------
# Visualización por producto
# -----------------------
for producto in productos:
    # Contenedor con borde (hacemos una caja visual con markdown + estilo inline)
    # Streamlit no tiene CSS directo de forma persistente, usamos markdown con HTML permitido para borde.
    st.markdown(
        f"""
        <div style="border:1px solid #eee; border-radius:8px; padding:18px; margin-bottom:18px; background-color: white;">
        </div>
        """,
        unsafe_allow_html=True
    )
    # Título del producto (en rojo) — respetando el formato solicitado "## :red[{nombre}]"
    st.markdown(f"## <span style='color:{COLOR_COST};'>{producto}</span>", unsafe_allow_html=True)

    # Obtener métricas totales para el producto
    total_row = totals[totals["producto"] == producto]
    if total_row.empty:
        total_cantidad = 0
        total_ingreso = 0.0
        total_costo = 0.0
    else:
        total_cantidad = int(total_row["cantidad"].values[0])
        total_ingreso = float(total_row["ingreso"].values[0])
        total_costo = float(total_row["costo"].values[0])

    # Cálculos solicitados: precio promedio = ingreso / cantidad, costo promedio = costo / cantidad
    precio_promedio_overall = (total_ingreso / total_cantidad) if total_cantidad != 0 else 0.0
    costo_promedio_overall = (total_costo / total_cantidad) if total_cantidad != 0 else 0.0

    # Layout de columnas 30% - 70%
    col_left, col_right = st.columns([0.3, 0.7])

    # Columna izquierda: métricas
    with col_left:
        st.write("Cantidad de ventas")
        st.markdown(f"### {format_int_thousands(total_cantidad)}")

        st.write("Precio promedio")
        st.markdown(f"### {format_money(precio_promedio_overall)}")

        st.write("Costo promedio")
        st.markdown(f"### {format_money(costo_promedio_overall)}")

    # Columna derecha: gráfico
    with col_right:
        # Preparamos datos mensuales 1..12
        prod_month = grouped[grouped["producto"] == producto].copy()

        # Asegurar que mes vaya de 1 a 12; rellenar meses faltantes con NaN/0 para trazar gaps adecuadamente
        months = list(range(1, 13))
        prod_month_indexed = prod_month.set_index("mes").reindex(months).reset_index().rename(columns={"index": "mes"})

        # Calcular promedio mensual: ingreso / cantidad (para cada mes) y costo / cantidad
        # Cuidado con division by zero por mes
        precio_mensual = []
        costo_mensual = []
        for _, row in prod_month_indexed.iterrows():
            cantidad_mes = row.get("cantidad", 0) if not pd.isna(row.get("cantidad", np.nan)) else 0
            ingreso_mes = row.get("ingreso", 0.0) if not pd.isna(row.get("ingreso", np.nan)) else 0.0
            costo_mes = row.get("costo", 0.0) if not pd.isna(row.get("costo", np.nan)) else 0.0

            if cantidad_mes == 0:
                precio_mensual.append(np.nan)
                costo_mensual.append(np.nan)
            else:
                precio_mensual.append(ingreso_mes / cantidad_mes)
                costo_mensual.append(costo_mes / cantidad_mes)

        # Crear figura Matplotlib con tamaño 8x3
        fig, ax = plt.subplots(figsize=(8, 3))

        # Plotear líneas con marcadores circulares, colores exactos solicitados
        ax.plot(months, precio_mensual, marker='o', linestyle='-', label='Precio promedio', color=COLOR_PRICE)
        ax.plot(months, costo_mensual, marker='o', linestyle='-', label='Costo promedio', color=COLOR_COST)

        # Etiquetas y título
        ax.set_title("Evolución de precio y costo promedio")
        ax.set_xlabel("Mes")
        ax.set_ylabel("Monto")

        # Eje X: aseguramos ticks de 1 a 12
        ax.set_xticks(months)
        ax.set_xlim(1, 12)

        # Leyenda en la mejor posición
        ax.legend(loc='best')

        # Grilla punteada con transparencia 30%
        ax.grid(linestyle=':', alpha=0.3)

        plt.tight_layout()

        # Mostrar con Streamlit
        st.pyplot(fig)

# -----------------------
# Fin
# -----------------------
st.markdown("---")
st.caption("Generado con Streamlit — TP5")

