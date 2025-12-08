import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")

import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")


st.sidebar.title("Configuración")
uploaded_file = st.sidebar.file_uploader(
    "Seleccioná un CSV", type=["csv"]
)


if not uploaded_file:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

df = pd.read_csv(uploaded_file)


available_years = sorted(df["año"].unique())
selected_year = st.sidebar.selectbox(
    "Seleccioná un año", options=available_years
)


df_year = df[df["año"] == selected_year]


if df_year.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()


st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

products = sorted(df_year["producto"].unique())

for product_name in products:
    with st.container(border=True):
        st.markdown(f"## :red[{product_name}]")

        df_product = df_year[df_year["producto"] == product_name]

        col1, col2 = st.columns([0.3, 0.7])

        with col1:
            total_quantity = df_product["cantidad"].sum()
            
            avg_price = (df_product["ingreso"] / df_product["cantidad"]).mean()
            avg_cost = (df_product["costo"] / df_product["cantidad"]).mean()

            st.metric(label="Cantidad de ventas", value=f"{total_quantity:,.0f}")
            st.metric(label="Precio promedio", value=f"${avg_price:,.2f}")
            st.metric(label="Costo promedio", value=f"${avg_cost:,.2f}")

        with col2:
            monthly_data = df_product.groupby("mes").agg(
                avg_price_monthly=("ingreso", lambda x: x.sum() / df_product.loc[x.index, "cantidad"].sum()),
                avg_cost_monthly=("costo", lambda x: x.sum() / df_product.loc[x.index, "cantidad"].sum())
            ).reset_index()
            
            fig, ax = plt.subplots(figsize=(8, 3))

            ax.plot(
                monthly_data["mes"],
                monthly_data["avg_price_monthly"],
                label="Precio promedio",
                marker="o",
                color="#1f77b4",
            )
            ax.plot(
                monthly_data["mes"],
                monthly_data["avg_cost_monthly"],
                label="Costo promedio",
                marker="o",
                color="#d62728",
            )

            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            ax.set_title("Evolución de precio y costo promedio")
            ax.legend(loc="best")
            ax.grid(True, linestyle="--", alpha=0.3)
            
            st.pyplot(fig)
