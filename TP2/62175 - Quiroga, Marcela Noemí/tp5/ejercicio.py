import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")

with st.sidebar:
    st.title("⚙️ Configuración")

    uploaded_file = st.file_uploader(
        label="-    Seleccione un CSV",
        type="csv"
    )

if uploaded_file is None:
    st.info("Suba un archivo CSV:")
    st.stop()

try:
    df = pd.read_csv(uploaded_file)

except Exception as e:
    st.error(f"⚠️ Error de CSV: {e}")
    st.stop()

with st.sidebar:
    available_years = sorted(df['año'].unique())
    selected_year = st.selectbox(
        label="-    Seleccione un año",
        options=available_years
    )

df_year = df[df['año'] == selected_year]

if df_year.empty:
    st.warning("El año seleccionado no contiene datos.")
    st.stop()

st.title("• Informe de Productos 📈")
st.caption("-   Metricas resumidas y seguimiento de precios/costo por año y mes: ")

products = sorted(df_year['producto'].unique())

for product_name in products:
    with st.container(border=True):
        st.markdown(f"## :red[{product_name}]")
        df_product = df_year[df_year['producto'] == product_name].copy()
        col_metrics, col_chart = st.columns([0.3, 0.7])

        with col_metrics:
            cant_tot = df_product['cantidad'].sum()
            ingr_tot = df_product['ingreso'].sum()
            costo_tot = df_product['costo'].sum()

            prec_prom = ingr_tot / cant_tot if cant_tot > 0 else 0
            costo_prom = costo_tot / cant_tot if cant_tot > 0 else 0

            st.metric(label="• Cantidad de ventas: ", value=f"{cant_tot:,}")
            st.metric(label="• Precio promedio: ", value=f"${prec_prom:,.0f}")
            st.metric(label="• Costo promedio: ", value=f"${costo_prom:,.0f}")

        with col_chart:
            monthly_data = df_product.groupby('mes').agg({
                'cantidad': 'sum',
                'ingreso': 'sum',
                'costo': 'sum'
            }).reset_index()

            monthly_data['precio_promedio'] = monthly_data['ingreso'] / monthly_data['cantidad']
            monthly_data['costo_promedio'] = monthly_data['costo'] / monthly_data['cantidad']
            monthly_data.sort_values('mes', inplace=True)

            fig, ax = plt.subplots(figsize=(8, 3))
            ax.plot(monthly_data['mes'], monthly_data['precio_promedio'], label='Precio promedio', marker='o', color='#1f77b4')
            ax.plot(monthly_data['mes'], monthly_data['costo_promedio'], label='Costo promedio', marker='o', color='#d62728')
            ax.set_xlabel('📆 Mes')
            ax.set_ylabel('💰 Monto')
            ax.set_title('📊 Seguimiento de precio y costo promedio')
            ax.legend(loc='best')
            ax.grid(True, linestyle='--', alpha=0.3)

            st.pyplot(fig)
