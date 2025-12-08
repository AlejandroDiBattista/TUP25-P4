import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt

st.set_page_config(page_title="Reporte de productos", layout="wide")

with st.sidebar:
    st.title("Configuración")
    uploaded_file = st.file_uploader("Seleccioná un CSV", type=["csv"])
    year_options = []
    if uploaded_file is not None:
        try:
            df_all = pd.read_csv(uploaded_file)
            df_all.columns = [c.strip() for c in df_all.columns]
            if 'año' in df_all.columns:
                try:
                    df_all['año'] = df_all['año'].astype(int)
                except Exception:
                    df_all['año'] = df_all['año']
            year_options = sorted(df_all['año'].dropna().unique().tolist())
        except Exception:
            year_options = []
    if year_options:
        selected_year = st.selectbox("Seleccioná un año", year_options)
    else:
        selected_year = st.selectbox("Seleccioná un año", ["-"])

if uploaded_file is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

try:
    df = df_all.copy()
except NameError:
    df = pd.read_csv(uploaded_file)
    df.columns = [c.strip() for c in df.columns]

required_cols = {'año', 'mes', 'producto', 'cantidad', 'ingreso', 'costo'}
if not required_cols.issubset(set(df.columns)):
    st.error(f"El CSV debe contener las columnas: {', '.join(required_cols)}")
    st.stop()

df['cantidad'] = pd.to_numeric(df['cantidad'], errors='coerce').fillna(0)
df['ingreso'] = pd.to_numeric(df['ingreso'], errors='coerce').fillna(0.0)
df['costo'] = pd.to_numeric(df['costo'], errors='coerce').fillna(0.0)
df['mes'] = pd.to_numeric(df['mes'], errors='coerce')

if selected_year == "-":
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

df_year = df[df['año'] == selected_year].copy()

if df_year.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

productos = sorted(df_year['producto'].dropna().unique().tolist())

for producto in productos:
    st.markdown("<div style='border:1px solid #ddd;padding:12px;border-radius:8px;margin-bottom:16px'>", unsafe_allow_html=True)
    st.markdown(f"## :red[{producto}]")

    prod_df = df_year[df_year['producto'] == producto].copy()
    monthly = (
        prod_df
        .groupby('mes', dropna=False)
        .agg({'cantidad': 'sum', 'ingreso': 'sum', 'costo': 'sum'})
        .reset_index()
        .sort_values('mes')
    )
    monthly['precio_promedio'] = monthly.apply(
        lambda r: (r['ingreso'] / r['cantidad']) if r['cantidad'] != 0 else 0.0,
        axis=1
    )
    monthly['costo_promedio'] = monthly.apply(
        lambda r: (r['costo'] / r['cantidad']) if r['cantidad'] != 0 else 0.0,
        axis=1
    )

    total_cantidad = prod_df['cantidad'].sum()
    total_ingreso = prod_df['ingreso'].sum()
    total_costo = prod_df['costo'].sum()

    precio_promedio_global = (total_ingreso / total_cantidad) if total_cantidad != 0 else 0.0
    costo_promedio_global = (total_costo / total_cantidad) if total_cantidad != 0 else 0.0

    col1, col2 = st.columns([0.3, 0.7])

    with col1:
        try:
            cantidad_display = f"{int(total_cantidad):,}"
        except Exception:
            cantidad_display = f"{total_cantidad:,}"
        st.markdown("**Cantidad de ventas**")
        st.write(cantidad_display)
        st.markdown("**Precio promedio**")
        st.write(f"{precio_promedio_global:.2f}")
        st.markdown("**Costo promedio**")
        st.write(f"{costo_promedio_global:.2f}")

    with col2:
        fig, ax = plt.subplots(figsize=(8, 3))
        x = monthly['mes'].tolist()
        y_precio = monthly['precio_promedio'].tolist()
        y_costo = monthly['costo_promedio'].tolist()
        ax.plot(x, y_precio, marker='o', linestyle='-', label='Precio promedio', color='#1f77b4')
        ax.plot(x, y_costo, marker='o', linestyle='-', label='Costo promedio', color='#d62728')
        ax.set_xlabel("Mes")
        ax.set_ylabel("Monto")
        ax.set_title("Evolución de precio y costo promedio")
        ax.grid(linestyle='--', alpha=0.3)
        ax.legend(loc='best')
        try:
            if all(pd.notna(monthly['mes'])) and pd.api.types.is_numeric_dtype(monthly['mes']):
                ax.set_xticks(x)
                ax.set_xticklabels([str(int(v)) for v in x])
            else:
                ax.set_xticks(range(len(x)))
                ax.set_xticklabels([str(v) for v in x])
        except Exception:
            ax.set_xticks(range(len(x)))
            ax.set_xticklabels([str(v) for v in x])
        plt.tight_layout()
        st.pyplot(fig)

    st.markdown("</div>", unsafe_allow_html=True) 

