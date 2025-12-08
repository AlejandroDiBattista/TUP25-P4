import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt

st.set_page_config(page_title="Reporte de productos", layout="wide")


def cargar_datos(archivo):
    df = pd.read_csv(archivo)
    columnas = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
    if not columnas.issubset(df.columns):
        st.error("El archivo no tiene las columnas requeridas.")
        st.stop()
    return df


def calcular_metricas(df):
    df["precio_promedio"] = df["ingreso"] / df["cantidad"]
    df["costo_promedio"] = df["costo"] / df["cantidad"]
    return df


def mostrar_mensaje(mensaje, tipo="info"):
    if tipo == "info":
        st.info(mensaje)
    elif tipo == "warning":
        st.warning(mensaje)
    st.stop()


def mostrar_producto(datos, producto):
    datos_prod = datos[datos["producto"] == producto]
    total_ventas = datos_prod["cantidad"].sum()
    precio_prom = datos_prod["precio_promedio"].mean()
    costo_prom = datos_prod["costo_promedio"].mean()

    with st.container():
        st.markdown(f"## :red[{producto}]")

        col1, col2 = st.columns([0.3, 0.7])

        with col1:
            st.metric("Cantidad de ventas", f"{total_ventas:,.0f}")
            st.metric("Precio promedio", f"${precio_prom:,.2f}")
            st.metric("Costo promedio", f"${costo_prom:,.2f}")

        with col2:
            fig, ax = plt.subplots(figsize=(8, 3))
            ax.plot(
                datos_prod["mes"], datos_prod["precio_promedio"],
                color="#1f77b4", marker="o", label="Precio promedio"
            )
            ax.plot(
                datos_prod["mes"], datos_prod["costo_promedio"],
                color="#d62728", marker="o", label="Costo promedio"
            )
            ax.set_title("Evolución de precio y costo promedio")
            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            ax.legend(loc="best")
            ax.grid(True, linestyle="--", alpha=0.3)
            st.pyplot(fig)


st.sidebar.title("Configuración")
archivo = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])

if not archivo:
    mostrar_mensaje("Subí un archivo CSV desde la barra lateral para comenzar.", "info")

df = cargar_datos(archivo)
anios = sorted(df["año"].unique())
anio = st.sidebar.selectbox("Seleccioná un año", anios)

df_anio = df[df["año"] == anio]
if df_anio.empty:
    mostrar_mensaje("El año seleccionado no tiene datos para mostrar.", "warning")

st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

df_anio = calcular_metricas(df_anio)

for producto in sorted(df_anio["producto"].unique()):
    mostrar_producto(df_anio, producto)