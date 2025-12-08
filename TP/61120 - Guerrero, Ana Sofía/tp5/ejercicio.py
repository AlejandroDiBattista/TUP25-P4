

import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt

st.set_page_config(page_title="Reporte de productos", layout="wide")


st.sidebar.title("Configuración")
archivo = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])
anio_seleccionado = None


if archivo is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()


df = pd.read_csv(archivo)


anios = sorted(df["año"].unique())
anio_seleccionado = st.sidebar.selectbox("Seleccioná un año", anios)


df_anio = df[df["año"] == anio_seleccionado]


if df_anio.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()


st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

for producto in sorted(df_anio["producto"].unique()):
    datos_prod = df_anio[df_anio["producto"] == producto].copy()

  
    datos_prod["precio_promedio"] = datos_prod["ingreso"] / datos_prod["cantidad"]
    datos_prod["costo_promedio"] = datos_prod["costo"] / datos_prod["cantidad"]

    cantidad_total = datos_prod["cantidad"].sum()
    precio_promedio = datos_prod["precio_promedio"].mean()
    costo_promedio = datos_prod["costo_promedio"].mean()

   
    with st.container(border=True):
        st.markdown(f"## :red[{producto}]")

        col1, col2 = st.columns([0.3, 0.7])

       
        with col1:
            st.metric("Cantidad de ventas", f"{cantidad_total:,.0f}")
            st.metric("Precio promedio", f"{precio_promedio:.2f}")
            st.metric("Costo promedio", f"{costo_promedio:.2f}")

        with col2:
            fig, ax = plt.subplots(figsize=(8, 3))
            ax.plot(
                datos_prod["mes"],
                datos_prod["precio_promedio"],
                color="#1f77b4",
                marker="o",
                label="Precio promedio"
            )
            ax.plot(
                datos_prod["mes"],
                datos_prod["costo_promedio"],
                color="#d62728",
                marker="o",
                label="Costo promedio"
            )
            ax.set_title("Evolución de precio y costo promedio")
            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            ax.legend(loc="best")
            ax.grid(True, linestyle="--", alpha=0.3)

            st.pyplot(fig)
