
import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt


st.set_page_config(page_title="Reporte de productos", layout="wide")


st.sidebar.title("Configuración")
archivo = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])


if archivo is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()


df = pd.read_csv(archivo)


columnas_esperadas = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
if not columnas_esperadas.issubset(df.columns):
    st.error("El CSV no tiene las columnas esperadas. Verificá la estructura.")
    st.stop()


años_disponibles = sorted(df["año"].unique())
año_seleccionado = st.sidebar.selectbox("Seleccioná un año", años_disponibles)


df_filtrado = df[df["año"] == año_seleccionado]

if df_filtrado.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()


st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")



df_filtrado["precio_promedio"] = df_filtrado["ingreso"] / df_filtrado["cantidad"]
df_filtrado["costo_promedio"] = df_filtrado["costo"] / df_filtrado["cantidad"]

for producto in sorted(df_filtrado["producto"].unique()):
    df_prod = df_filtrado[df_filtrado["producto"] == producto]

    
    cantidad_total = df_prod["cantidad"].sum()
    precio_prom = df_prod["precio_promedio"].mean()
    costo_prom = df_prod["costo_promedio"].mean()

   
    with st.container(border=True):
        st.markdown(f"## :red[{producto}]")

        col1, col2 = st.columns([0.3, 0.7])

        
        with col1:
            st.metric("Cantidad total vendida", f"{cantidad_total:,.0f}")
            st.metric("Precio promedio", f"${precio_prom:,.2f}")
            st.metric("Costo promedio", f"${costo_prom:,.2f}")

      
        with col2:
           
            resumen_mensual = (
                df_prod.groupby("mes")[["precio_promedio", "costo_promedio"]]
                .mean()
                .reset_index()
                .sort_values("mes")
            )

            fig, ax = plt.subplots(figsize=(8, 3))
            ax.plot(
                resumen_mensual["mes"],
                resumen_mensual["precio_promedio"],
                color="#1f77b4",
                marker="o",
                label="Precio promedio"
            )
            ax.plot(
                resumen_mensual["mes"],
                resumen_mensual["costo_promedio"],
                color="#d62728",
                marker="o",
                label="Costo promedio"
            )

            ax.set_title("Evolución de precio y costo promedio")
            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            ax.legend()
            ax.grid(True, linestyle="--", alpha=0.3)
            st.pyplot(fig)
