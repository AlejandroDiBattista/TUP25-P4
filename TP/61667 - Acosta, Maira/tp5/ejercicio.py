import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")

st.sidebar.title("Configuración")
uploaded_file = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])

if uploaded_file is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()


df = pd.read_csv(uploaded_file)

expected_columns = ["año", "mes", "producto", "cantidad", "ingreso", "costo"]
if not all(col in df.columns for col in expected_columns):
    st.error(f"El CSV debe contener las columnas: {expected_columns}")
    st.stop()


years = sorted(df["año"].dropna().unique())
selected_year = st.sidebar.selectbox("Seleccioná un año", years)

df_year = df[df["año"] == selected_year]
if df_year.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()


st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")


products = sorted(df_year["producto"].unique())

for product in products:
    product_data = df_year[df_year["producto"] == product]

    total_quantity = product_data["cantidad"].sum()
    price_avg = product_data["ingreso"].sum() / total_quantity
    cost_avg = product_data["costo"].sum() / total_quantity

   
    with st.container():
        st.markdown(
            f"""
            <div style="
                border:1px solid #ddd; 
                padding:15px; 
                margin-bottom:20px; 
                border-radius:10px;
                background-color:#fafafa;
            ">
            <h2 style="color:red">{product}</h2>
            </div>
            """, unsafe_allow_html=True
        )

        # Columnas
        col1, col2 = st.columns([0.3, 0.7])

        with col1:
            st.markdown(f"**Cantidad de ventas**\n\n{total_quantity:,}")
            st.markdown(f"**Precio promedio**\n\n${price_avg:,.2f}")
            st.markdown(f"**Costo promedio**\n\n${cost_avg:,.2f}")

        with col2:
            monthly_data = product_data.groupby("mes").agg(
                ingreso_total=("ingreso", "sum"),
                costo_total=("costo", "sum"),
                cantidad_total=("cantidad", "sum")
            ).reset_index()

            monthly_data["precio_promedio"] = monthly_data["ingreso_total"] / monthly_data["cantidad_total"]
            monthly_data["costo_promedio"] = monthly_data["costo_total"] / monthly_data["cantidad_total"]

            monthly_data = monthly_data.sort_values("mes")

            # Gráfico
            fig, ax = plt.subplots(figsize=(8, 3))
            ax.plot(monthly_data["mes"], monthly_data["precio_promedio"], marker="o", color="#1f77b4", label="Precio promedio")
            ax.plot(monthly_data["mes"], monthly_data["costo_promedio"], marker="o", color="#d62728", label="Costo promedio")
            ax.set_title("Evolución de precio y costo promedio")
            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            ax.grid(True, linestyle="--", alpha=0.3)
            ax.legend()
            st.pyplot(fig)