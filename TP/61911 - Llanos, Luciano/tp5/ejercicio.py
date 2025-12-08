import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")

st.write("Escribir aca la solucion del TP5")
# ejercicio.py
import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import calendar

# 1. Configuración de la página
st.set_page_config(page_title="Reporte de productos", layout="wide")

# --- Sidebar ---
with st.sidebar:
    st.title("Configuración")

    uploaded_file = st.file_uploader(
        label="Seleccioná un CSV",
        type=["csv"],
        help="Subí un archivo CSV con las columnas: año, mes, producto, cantidad, ingreso, costo"
    )

    # placeholder for year selectbox. We'll populate after loading CSV
    year_placeholder = st.empty()

# Validación: si no se cargó archivo -> mostrar info y detener ejecución
if uploaded_file is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

# Leer CSV
try:
    df = pd.read_csv(uploaded_file)
except Exception as e:
    st.error(f"Error al leer el CSV: {e}")
    st.stop()

# Verificar que las columnas requeridas existan
required_cols = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
if not required_cols.issubset(set(df.columns)):
    st.error(f"El CSV debe contener las columnas: {', '.join(required_cols)}")
    st.stop()

# Asegurar tipos
# Convertir a tipos numéricos donde corresponda (int/float)
df["año"] = pd.to_numeric(df["año"], errors="coerce").astype("Int64")
df["mes"] = pd.to_numeric(df["mes"], errors="coerce").astype("Int64")
df["cantidad"] = pd.to_numeric(df["cantidad"], errors="coerce").fillna(0)
df["ingreso"] = pd.to_numeric(df["ingreso"], errors="coerce").fillna(0.0)
df["costo"] = pd.to_numeric(df["costo"], errors="coerce").fillna(0.0)

# Remover filas con año o mes faltante
df = df.dropna(subset=["año", "mes", "producto"])

# Obtener años disponibles ordenados
available_years = sorted(df["año"].dropna().unique().tolist())

# Colocar selectbox en el sidebar ahora que tenemos años
with st.sidebar:
    if available_years:
        selected_year = year_placeholder.selectbox("Seleccioná un año", available_years)
    else:
        # Si no hay años en el dataset (caso extraño)
        st.info("No se encontraron años válidos en el CSV.")
        st.stop()

# Filtrar por año
df_year = df[df["año"] == selected_year]

# Validación: si el año seleccionado no tiene datos
if df_year.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

# --- Encabezado principal ---
st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

# Normalizar nombre de producto y orden alfabético
products = sorted(df_year["producto"].dropna().astype(str).unique())

# Para cada producto, crear contenedor con borde
for producto in products:
    prod_df = df_year[df_year["producto"].astype(str) == str(producto)].copy()

    # Si no hay filas (por cualquier motivo), saltar
    if prod_df.empty:
        continue

    # Calculos globales para el producto
    total_cantidad = prod_df["cantidad"].sum()
    # Evitar división por cero
    if total_cantidad == 0:
        precio_promedio = 0.0
        costo_promedio = 0.0
    else:
        precio_promedio = prod_df["ingreso"].sum() / total_cantidad
        costo_promedio = prod_df["costo"].sum() / total_cantidad

    # Contenedor con borde (usando HTML/CSS)
    container_html = f"""
    <div style="
        border:1px solid #dcdcdc;
        padding:16px;
        border-radius:8px;
        margin-bottom:12px;
        background-color: #ffffff;">
    """
    st.markdown(container_html, unsafe_allow_html=True)

    # Título del producto en el formato solicitado
    st.markdown(f"## :red[{producto}]")

    # Columnas 30% / 70%
    col_left, col_right = st.columns([0.3, 0.7])

    # Columna de métricas (izquierda)
    with col_left:
        st.markdown("**Cantidad de ventas**")
        # Formato de miles con comas
        try:
            cantidad_formateada = f"{int(total_cantidad):,}"
        except Exception:
            # Por si total_cantidad no entero
            cantidad_formateada = f"{total_cantidad:,.0f}"
        st.write(cantidad_formateada)

        st.markdown("**Precio promedio**")
        st.write(f"{precio_promedio:.2f}")

        st.markdown("**Costo promedio**")
        st.write(f"{costo_promedio:.2f}")

    # Columna de gráfico (derecha)
    with col_right:
        # Agrupar por mes y calcular precios y costos promedios mensuales
        grouped = (
            prod_df
            .groupby("mes", as_index=False)
            .agg({
                "cantidad": "sum",
                "ingreso": "sum",
                "costo": "sum"
            })
            .sort_values("mes")
        )

        # Calcular precio promedio y costo promedio por mes (sum(ingreso)/sum(cantidad))
        def safe_divide(num, den):
            return num / den if den != 0 else 0.0

        grouped["precio_promedio"] = grouped.apply(lambda r: safe_divide(r["ingreso"], r["cantidad"]), axis=1)
        grouped["costo_promedio"] = grouped.apply(lambda r: safe_divide(r["costo"], r["cantidad"]), axis=1)

        # Preparar eje X (meses). Mostrar nombre del mes (ej: Ene, Feb, ...)
        meses = grouped["mes"].astype(int).tolist()
        meses_nombres = [calendar.month_name[m] if 1 <= m <= 12 else str(m) for m in meses]

        precio_mensual = grouped["precio_promedio"].tolist()
        costo_mensual = grouped["costo_promedio"].tolist()

        # Crear figura Matplotlib con tamaño 8x3
        fig, ax = plt.subplots(figsize=(8, 3))
        # Línea precio promedio (azul #1f77b4) con marcadores circulares
        ax.plot(meses_nombres, precio_mensual, marker="o", linestyle="-", label="Precio promedio", color="#1f77b4")
        # Línea costo promedio (rojo #d62728) con marcadores circulares
        ax.plot(meses_nombres, costo_mensual, marker="o", linestyle="-", label="Costo promedio", color="#d62728")

        ax.set_xlabel("Mes")
        ax.set_ylabel("Monto")
        ax.set_title("Evolución de precio y costo promedio")
        ax.legend(loc="best")
        ax.grid(True, linestyle="--", alpha=0.3)

        plt.tight_layout()
        st.pyplot(fig)

    # Cerrar el div contenedor (no visible, pero para buena práctica)
    st.markdown("</div>", unsafe_allow_html=True)
