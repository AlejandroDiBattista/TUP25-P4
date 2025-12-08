import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")

# --- CARGA DEL ARCHIVO ---
st.sidebar.title("Configuración")
archivo = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])

if archivo is not None:
    df = pd.read_csv(archivo)

    # Obtener años únicos
    años_disponibles = sorted(df["año"].unique())
    año_seleccionado = st.sidebar.selectbox("Seleccioná un año", años_disponibles)
else:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

# --- FILTRO POR AÑO ---
df_filtrado = df[df["año"] == año_seleccionado]

if df_filtrado.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

# --- VISUALIZACIÓN POR PRODUCTO ---
productos = sorted(df_filtrado["producto"].unique())

for producto in productos:
    datos_producto = df_filtrado[df_filtrado["producto"] == producto]

    # Cálculos
    cantidad_total = datos_producto["cantidad"].sum()
    precio_promedio = (datos_producto["ingreso"].sum() / cantidad_total)
    costo_promedio = (datos_producto["costo"].sum() / cantidad_total)

    # Mostrar contenedor con borde
    with st.container():
        st.markdown(f"## :red[{producto}]")

        col1, col2 = st.columns([0.3, 0.7])

        with col1:
            st.metric("Cantidad de ventas", f"{cantidad_total:,.0f}")
            st.metric("Precio promedio", f"${precio_promedio:,.2f}")
            st.metric("Costo promedio", f"${costo_promedio:,.2f}")

        with col2:
            # Promedios por mes
            resumen_mensual = datos_producto.groupby("mes").agg(
                precio_promedio=("ingreso", lambda x: x.sum() / datos_producto.loc[x.index, "cantidad"].sum()),
                costo_promedio=("costo", lambda x: x.sum() / datos_producto.loc[x.index, "cantidad"].sum())
            ).reset_index()

            fig, ax = plt.subplots(figsize=(8, 3))
            ax.plot(resumen_mensual["mes"], resumen_mensual["precio_promedio"], 'o-', color="#1f77b4", label="Precio promedio")
            ax.plot(resumen_mensual["mes"], resumen_mensual["costo_promedio"], 'o-', color="#d62728", label="Costo promedio")

            ax.set_title("Evolución de precio y costo promedio")
            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            ax.grid(True, linestyle='--', alpha=0.3)
            ax.legend()

            st.pyplot(fig)

