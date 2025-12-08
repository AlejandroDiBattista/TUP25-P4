import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt

# ------------------------------
# CONFIGURACIÓN DE LA PÁGINA
# ------------------------------
st.set_page_config(page_title="Reporte de productos", layout="wide")

# ------------------------------
# BARRA LATERAL
# ------------------------------
st.sidebar.title("Configuración")
archivo = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])

# Placeholder para los años
if archivo is not None:
    df = pd.read_csv(archivo)
    if 'año' not in df.columns or 'mes' not in df.columns or 'producto' not in df.columns:
        st.error("El archivo CSV no tiene el formato esperado.")
        st.stop()
    años_disponibles = sorted(df["año"].unique())
    año_seleccionado = st.sidebar.selectbox("Seleccioná un año", años_disponibles)
else:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

# ------------------------------
# FILTRADO POR AÑO
# ------------------------------
df_filtrado = df[df["año"] == año_seleccionado]

if df_filtrado.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

# ------------------------------
# ENCABEZADO PRINCIPAL
# ------------------------------
st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

# ------------------------------
# PROCESAMIENTO DE DATOS
# ------------------------------
df_filtrado["precio_promedio"] = df_filtrado["ingreso"] / df_filtrado["cantidad"]
df_filtrado["costo_promedio"] = df_filtrado["costo"] / df_filtrado["cantidad"]

productos = sorted(df_filtrado["producto"].unique())

# ------------------------------
# VISUALIZACIÓN POR PRODUCTO
# ------------------------------
for producto in productos:
    data_prod = df_filtrado[df_filtrado["producto"] == producto]

    total_ventas = data_prod["cantidad"].sum()
    precio_prom = data_prod["precio_promedio"].mean()
    costo_prom = data_prod["costo_promedio"].mean()

    # Contenedor con borde
    with st.container():
        st.markdown(
            f"""
            <div style="border:1px solid #ddd; padding:20px; border-radius:10px; margin-bottom:20px;">
                <h2 style="color:#d62728; margin-bottom:10px;">{producto}</h2>
            </div>
            """,
            unsafe_allow_html=True,
        )

        col1, col2 = st.columns([0.3, 0.7])

        # --- Columna izquierda: métricas ---
        with col1:
            st.markdown(f"**Cantidad de ventas**")
            st.markdown(f"{total_ventas:,.0f}")

            st.markdown(f"**Precio promedio**")
            st.markdown(f"${precio_prom:,.2f}")

            st.markdown(f"**Costo promedio**")
            st.markdown(f"${costo_prom:,.2f}")

        # --- Columna derecha: gráfico ---
        with col2:
            fig, ax = plt.subplots(figsize=(8, 3))

            ax.plot(
                data_prod["mes"],
                data_prod["precio_promedio"],
                color="#1f77b4",
                marker="o",
                label="Precio promedio",
            )
            ax.plot(
                data_prod["mes"],
                data_prod["costo_promedio"],
                color="#d62728",
                marker="o",
                label="Costo promedio",
            )

            ax.set_title("Evolución de precio y costo promedio")
            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            ax.legend(loc="best")
            ax.grid(True, linestyle="--", alpha=0.3)

            st.pyplot(fig)