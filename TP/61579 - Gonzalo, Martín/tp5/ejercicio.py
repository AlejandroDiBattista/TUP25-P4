import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st




# -------------------------
# 1. Configuración de la página
# -------------------------
st.set_page_config(page_title="Reporte de productos", layout="wide")

# CSS para contenedores con borde y algo de padding (para parecerse a la imagen)
st.markdown(
    """
    <style>
    .product-card {
        border: 1px solid #e6e6e6;
        border-radius: 8px;
        padding: 18px;
        margin-bottom: 24px;
        background-color: white;
    }
    .product-title {
        color: #b22222; /* rojo tenue similar al ejemplo */
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 8px;
    }
    .metrics-number {
        font-size: 28px;
        font-weight: 600;
    }
    .metrics-label {
        color: #555;
        margin-bottom: 6px;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# -------------------------
# 2. Sidebar
# -------------------------
with st.sidebar:
    st.title("Configuración")
    uploaded_file = st.file_uploader("Seleccioná un CSV", type=["csv"])
    # placeholder for years; will be replaced after reading file
    year_select = None

# -------------------------
# 3. Validaciones - sin archivo
# -------------------------
if uploaded_file is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

# -------------------------
# 4. Lectura y normalización CSV
# -------------------------
try:
    df = pd.read_csv(uploaded_file)
except Exception as e:
    st.error(f"Error al leer el CSV: {e}")
    st.stop()

# Normalizar nombres de columnas (en minúsculas) para evitar problemas
df.columns = [c.strip().lower() for c in df.columns]

required_cols = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
if not required_cols.issubset(set(df.columns)):
    st.error(
        "El archivo CSV debe contener las columnas: año, mes, producto, cantidad, ingreso, costo"
    )
    st.stop()

# Asegurar tipos
# Intentamos convertir a numéricas las columnas que deben ser numéricas
df["año"] = pd.to_numeric(df["año"], errors="coerce").astype("Int64")
df["mes"] = pd.to_numeric(df["mes"], errors="coerce").astype("Int64")
df["cantidad"] = pd.to_numeric(df["cantidad"], errors="coerce").fillna(0)
df["ingreso"] = pd.to_numeric(df["ingreso"], errors="coerce").fillna(0.0)
df["costo"] = pd.to_numeric(df["costo"], errors="coerce").fillna(0.0)

# -------------------------
# 2b. Sidebar (años) - ahora que tenemos el dataframe
# -------------------------
with st.sidebar:
    anos_disponibles = sorted(df["año"].dropna().unique().tolist())
    if len(anos_disponibles) == 0:
        st.info("El CSV no contiene años válidos en la columna 'año'.")
        st.stop()
    year_select = st.selectbox("Seleccioná un año", anos_disponibles, index=0)

# Filtrar por año seleccionado
df_year = df[df["año"] == year_select]

# -------------------------
# 3b. Validación - año sin datos
# -------------------------
if df_year.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

# -------------------------
# 4. Encabezado principal
# -------------------------
st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

# -------------------------
# 5. Agrupaciones y visualización por producto
# -------------------------
# Asegurarnos que 'producto' sea str
df_year["producto"] = df_year["producto"].astype(str)

productos = sorted(df_year["producto"].dropna().unique().tolist())

# Para cada producto:
for producto in productos:
    df_prod = df_year[df_year["producto"] == producto].copy()

    # Calculos globales por producto (totales)
    total_cantidad = df_prod["cantidad"].sum()
    total_ingreso = df_prod["ingreso"].sum()
    total_costo = df_prod["costo"].sum()

    # Evitar división por cero en promedio
    precio_promedio_global = (total_ingreso / total_cantidad) if total_cantidad != 0 else 0.0
    costo_promedio_global = (total_costo / total_cantidad) if total_cantidad != 0 else 0.0

    # Preparar serie mensual: agrupar por mes y calcular suma de cantidad, ingreso y costo
    monthly = (
        df_prod.groupby("mes", as_index=False)
        .agg({"cantidad": "sum", "ingreso": "sum", "costo": "sum"})
    )

    # Calcular promedios mensuales: ingreso/cantidad y costo/cantidad por mes (evitar div 0)
    monthly["precio_promedio"] = monthly.apply(
        lambda r: (r["ingreso"] / r["cantidad"]) if r["cantidad"] != 0 else np.nan, axis=1
    )
    monthly["costo_promedio"] = monthly.apply(
        lambda r: (r["costo"] / r["cantidad"]) if r["cantidad"] != 0 else np.nan, axis=1
    )

    # Asegurar meses 1..12 en el eje (para no romper la X)
    meses_esperados = pd.DataFrame({"mes": list(range(1, 13))})
    monthly = meses_esperados.merge(monthly, on="mes", how="left").sort_values("mes")

    # Interpolación/llenado opcional: dejaremos NaN donde no haya datos (para que matplotlib no conecte esos puntos)
    # Crear el contenedor visual con borde (usa CSS arriba)
    st.markdown(f'<div class="product-card">', unsafe_allow_html=True)

    # a) Título del producto
    st.markdown(f'<div class="product-title">## :red[{producto}]</div>', unsafe_allow_html=True)

    # b) Columnas 30% / 70%
    col_left, col_right = st.columns([0.3, 0.7])

    with col_left:
        st.markdown('<div class="metrics-label">Cantidad de ventas</div>', unsafe_allow_html=True)
        # Mostrar miles con separador de coma
        try:
            cantidad_display = f"{int(total_cantidad):,}"
        except Exception:
            cantidad_display = f"{total_cantidad:,}"
        st.markdown(f'<div class="metrics-number">{cantidad_display}</div>', unsafe_allow_html=True)

        st.markdown('<div class="metrics-label">Precio promedio</div>', unsafe_allow_html=True)
        st.markdown(f'<div class="metrics-number">${precio_promedio_global:,.2f}</div>', unsafe_allow_html=True)

        st.markdown('<div class="metrics-label">Costo promedio</div>', unsafe_allow_html=True)
        st.markdown(f'<div class="metrics-number">${costo_promedio_global:,.2f}</div>', unsafe_allow_html=True)

    with col_right:
        # Gráfico matplotlib (figsize 8x3)
        fig, ax = plt.subplots(figsize=(8, 3))
        x = monthly["mes"]

        # plot precio promedio
        ax.plot(
            x,
            monthly["precio_promedio"],
            marker="o",
            linestyle="-",
            label="Precio promedio",
            color="#1f77b4",
        )

        # plot costo promedio
        ax.plot(
            x,
            monthly["costo_promedio"],
            marker="o",
            linestyle="-",
            label="Costo promedio",
            color="#d62728",
        )

        ax.set_title("Evolución de precio y costo promedio")
        ax.set_xlabel("Mes")
        ax.set_ylabel("Monto")
        ax.set_xticks(range(1, 13))
        ax.grid(linestyle="--", alpha=0.3)
        ax.legend(loc="best")

        # Ajuste de layout y mostrar
        plt.tight_layout()
        st.pyplot(fig)
        plt.close(fig)

    st.markdown("</div>", unsafe_allow_html=True)

