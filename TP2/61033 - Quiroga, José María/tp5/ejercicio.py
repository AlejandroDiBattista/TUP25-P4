import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np


st.set_page_config(page_title="Reporte de productos", layout="wide")


def load_csv(uploaded_file):
    try:
        df = pd.read_csv(uploaded_file)
        return df
    except Exception:
        return None


def monthly_avgs(df_prod):
    # agrupar por mes y calcular promedios ponderados (ingreso/cantidad, costo/cantidad)
    agg = df_prod.groupby('mes').agg({'ingreso': 'sum', 'costo': 'sum', 'cantidad': 'sum'})
    # evitar división por cero
    agg['precio_prom'] = np.where(agg['cantidad'] > 0, agg['ingreso'] / agg['cantidad'], 0.0)
    agg['costo_prom'] = np.where(agg['cantidad'] > 0, agg['costo'] / agg['cantidad'], 0.0)
    return agg.reindex(range(1, 13), fill_value=0.0)


# Sidebar
st.sidebar.title("Configuración")
uploaded = st.sidebar.file_uploader("Seleccioná un CSV", type=['csv'])

df = None
if uploaded is not None:
    df = load_csv(uploaded)

if df is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

# comprobar columnas mínimas
expected_cols = {'año', 'mes', 'producto', 'cantidad', 'ingreso', 'costo'}
if not expected_cols.issubset(set(df.columns)):
    st.error("El CSV no contiene las columnas requeridas.")
    st.stop()

# normalizar tipos
df = df.copy()
df['año'] = df['año'].astype(int)
df['mes'] = df['mes'].astype(int)
df['producto'] = df['producto'].astype(str)
df['cantidad'] = pd.to_numeric(df['cantidad'], errors='coerce').fillna(0)
df['ingreso'] = pd.to_numeric(df['ingreso'], errors='coerce').fillna(0.0)
df['costo'] = pd.to_numeric(df['costo'], errors='coerce').fillna(0.0)

years = sorted(df['año'].unique())
year = st.sidebar.selectbox("Seleccioná un año", years if years else [], index=0 if years else None)

if year is None or year not in years:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

# filtrar por año
df_year = df[df['año'] == year]
if df_year.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

products = sorted(df_year['producto'].unique())

for producto in products:
    prod_df = df_year[df_year['producto'] == producto]
    if prod_df.empty:
        continue

    # contenedor con borde (HTML)
    st.markdown(f"<div style='border:1px solid #e6e6e6; padding:12px; border-radius:8px; margin-bottom:12px;'>", unsafe_allow_html=True)
    st.markdown(f"## :red[{producto}]")

    col1, col2 = st.columns([0.3, 0.7])

    # métricas
    total_cantidad = int(prod_df['cantidad'].sum())
    precio_prom_total = (prod_df['ingreso'].sum() / prod_df['cantidad'].sum()) if prod_df['cantidad'].sum() > 0 else 0.0
    costo_prom_total = (prod_df['costo'].sum() / prod_df['cantidad'].sum()) if prod_df['cantidad'].sum() > 0 else 0.0

    with col1:
        st.write("**Cantidad de ventas**")
        st.write(f"{total_cantidad:,}")
        st.write("**Precio promedio**")
        st.write(f"${precio_prom_total:,.2f}")
        st.write("**Costo promedio**")
        st.write(f"${costo_prom_total:,.2f}")

    with col2:
        # preparar serie mensual
        agg = monthly_avgs(prod_df)
        months = np.arange(1, 13)
        precio_serie = agg['precio_prom'].values
        costo_serie = agg['costo_prom'].values

        fig, ax = plt.subplots(figsize=(8, 3))
        ax.plot(months, precio_serie, color='#1f77b4', marker='o', label='Precio promedio')
        ax.plot(months, costo_serie, color='#d62728', marker='o', label='Costo promedio')
        ax.set_xticks(months)
        ax.set_xlabel('Mes')
        ax.set_ylabel('Monto')
        ax.set_title('Evolución de precio y costo promedio')
        ax.legend(loc='best')
        ax.grid(True, linestyle='--', alpha=0.3)
        fig.tight_layout()
        st.pyplot(fig)

    st.markdown("</div>", unsafe_allow_html=True)
import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")

st.write("Escribir aca la solucion del TP5")