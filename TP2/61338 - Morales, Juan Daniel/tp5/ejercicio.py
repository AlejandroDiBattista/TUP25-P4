import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

# ---------------------------------------------------------------
# CONFIGURACIÓN DE LA PÁGINA
# ---------------------------------------------------------------
st.set_page_config(page_title="Reporte de productos", layout="wide")

# ---------------------------------------------------------------
# BARRA LATERAL
# ---------------------------------------------------------------
st.sidebar.title("Configuración")

# Selector de archivo CSV
archivo = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])

# Si no hay archivo, mostrar aviso y detener ejecución
if not archivo:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

# Lectura del CSV
df = pd.read_csv(archivo)

# Validar que tenga las columnas requeridas
columnas_requeridas = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
if not columnas_requeridas.issubset(df.columns):
    st.error("El archivo CSV no contiene las columnas requeridas: año, mes, producto, cantidad, ingreso, costo.")
    st.stop()

# Selector de año (ordenado)
años_disponibles = sorted(df["año"].unique())
año_seleccionado = st.sidebar.selectbox("Seleccioná un año", años_disponibles)

# Filtrar por año seleccionado
df_año = df[df["año"] == año_seleccionado]

# Si no hay datos para el año, mostrar advertencia
if df_año.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

# ---------------------------------------------------------------
# ENCABEZADO PRINCIPAL
# ---------------------------------------------------------------
st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

# ---------------------------------------------------------------
# PROCESAMIENTO DE DATOS
# ---------------------------------------------------------------
# Agrupar por producto y mes
agrupado = df_año.groupby(["producto", "mes"]).agg({
    "cantidad": "sum",
    "ingreso": "sum",
    "costo": "sum"
}).reset_index()

# Calcular métricas por mes
agrupado["precio_promedio"] = agrupado["ingreso"] / agrupado["cantidad"]
agrupado["costo_promedio"] = agrupado["costo"] / agrupado["cantidad"]

# ---------------------------------------------------------------
# VISUALIZACIÓN POR PRODUCTO
# ---------------------------------------------------------------
productos = sorted(agrupado["producto"].unique())

for producto in productos:
    datos = agrupado[agrupado["producto"] == producto]

    # Contenedor con borde para cada producto
    with st.container():
        # Título del producto
        st.markdown(f"## :red[{producto}]")

        # Dividir en dos columnas (30% - 70%)
        col1, col2 = st.columns([0.3, 0.7])

        # -------------------------
        # Columna 1: Métricas
        # -------------------------
        with col1:
            cantidad_total = datos["cantidad"].sum()
            precio_promedio = datos["precio_promedio"].mean()
            costo_promedio = datos["costo_promedio"].mean()

            st.metric("Cantidad de ventas", f"{cantidad_total:,.0f}".replace(",", "."))
            st.metric("Precio promedio", f"${precio_promedio:,.2f}")
            st.metric("Costo promedio", f"${costo_promedio:,.2f}")

        # -------------------------
        # Columna 2: Gráfico
        # -------------------------
        with col2:
            fig, ax = plt.subplots(figsize=(8, 3))

            # Línea azul (precio)
            ax.plot(
                datos["mes"], datos["precio_promedio"],
                color="#1f77b4", marker="o", label="Precio promedio"
            )

            # Línea roja (costo)
            ax.plot(
                datos["mes"], datos["costo_promedio"],
                color="#d62728", marker="o", label="Costo promedio"
            )

            # Formato del gráfico
            ax.set_title("Evolución de precio y costo promedio")
            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            ax.grid(True, linestyle="--", alpha=0.3)
            ax.legend(loc="best")

            st.pyplot(fig)
