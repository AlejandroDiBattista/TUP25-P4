import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")

st.sidebar.title("Configuración")
uploaded = st.sidebar.file_uploader("Seleccioná un CSV", type="csv")

if uploaded is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

data = pd.read_csv(uploaded)

available_years = sorted(data["año"].dropna().unique())

selected_year = st.sidebar.selectbox("Seleccioná un año", available_years)
data = data[data["año"] == selected_year]

if data.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

for product, product_df in sorted(data.groupby("producto")):
        
    product_df = product_df.assign(
        precio_promedio=lambda df: df["ingreso"] / df["cantidad"],
        costo_promedio=lambda df: df["costo"] / df["cantidad"],
    )

    with st.container(border=True):
        st.markdown(f"## :red[{product}]")
        col_metrics, col_chart = st.columns([0.3, 0.7])

        with col_metrics:
            st.metric("Cantidad de ventas", f"{product_df['cantidad'].sum():,.0f}")
            st.metric("Precio promedio", f"${product_df['precio_promedio'].mean():,.0f}")
            st.metric("Costo promedio", f"${product_df['costo_promedio'].mean():,.0f}")

        with col_chart:
            fig, ax = plt.subplots(figsize=(8, 4))
            ax.plot(
                product_df["mes"],
                product_df["precio_promedio"],
                color="#1f77b4",
                marker="o",
                label="Precio promedio",
            )
            ax.plot(
                product_df["mes"],
                product_df["costo_promedio"],
                color="#d62728",
                marker="o",
                label="Costo promedio",
            )
            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            ax.set_title("Evolución de precio y costo promedio")
            ax.legend(loc="best")
            ax.grid(True, linestyle="--", alpha=0.3)
            st.pyplot(fig)
