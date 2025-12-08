import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

st.set_page_config(page_title="Reporte de productos", page_icon="📈", layout="wide")

st.sidebar.title("Configuración")
uploaded = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])

if not uploaded:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

# load dataframe
try:
    df = pd.read_csv(uploaded)
except Exception:
    st.error("Error al leer el CSV. Verifique el archivo.")
    st.stop()

# normalizar nombres de columnas (por si vienen con espacios)
df.columns = df.columns.str.strip()

# comprobar columnas requeridas
required = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
if not required.issubset(set(df.columns)):
    st.error(f"El CSV debe contener las columnas: {', '.join(sorted(required))}")
    st.stop()

# convertir tipos
df["año"] = pd.to_numeric(df["año"], errors="coerce").astype("Int64")
df["mes"] = pd.to_numeric(df["mes"], errors="coerce").astype("Int64")
df["cantidad"] = pd.to_numeric(df["cantidad"], errors="coerce").fillna(0)
df["ingreso"] = pd.to_numeric(df["ingreso"], errors="coerce").fillna(0.0)
df["costo"] = pd.to_numeric(df["costo"], errors="coerce").fillna(0.0)

# limpiar filas inválidas
df = df.dropna(subset=["año", "mes", "producto"])
if df.empty:
    st.warning("El archivo CSV no contiene datos válidos.")
    st.stop()

years = sorted(df["año"].dropna().unique().tolist())
if not years:
    st.warning("El archivo CSV no contiene años válidos.")
    st.stop()

year = st.sidebar.selectbox("Seleccioná un año", options=years)

# filtrar por año
df_year = df[df["año"] == year]
if df_year.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

# preparación por producto
productos = sorted(df_year["producto"].dropna().unique().tolist())

for producto in productos:
    df_prod = df_year[df_year["producto"] == producto].copy()
    if df_prod.empty:
        continue

    # agrupar por mes: sumar cantidad, ingreso y costo por mes
    grup = df_prod.groupby("mes", as_index=False).agg({
        "cantidad": "sum",
        "ingreso": "sum",
        "costo": "sum"
    })

    # ordenar por mes y calcular promedios (evitando división por cero)
    grup = grup.sort_values("mes")
    grup["precio_prom"] = np.where(grup["cantidad"] > 0, grup["ingreso"] / grup["cantidad"], np.nan)
    grup["costo_prom"] = np.where(grup["cantidad"] > 0, grup["costo"] / grup["cantidad"], np.nan)

    # métricas agregadas para la columna izquierda
    total_cantidad = int(df_prod["cantidad"].sum())
    precio_prom_total = (df_prod["ingreso"].sum() / df_prod["cantidad"].sum()) if df_prod["cantidad"].sum() > 0 else 0.0
    costo_prom_total = (df_prod["costo"].sum() / df_prod["cantidad"].sum()) if df_prod["cantidad"].sum() > 0 else 0.0

    # contenedor con borde
    st.markdown(
        "<div style='border:1px solid #ddd;padding:12px;border-radius:8px;margin-bottom:12px'>",
        unsafe_allow_html=True,
    )

    # título del producto con el formato requerido
    st.markdown(f"## :red[{producto}]")

    col1, col2 = st.columns([0.3, 0.7])
    with col1:
        st.markdown("**Cantidad de ventas**")
        st.write(f"{total_cantidad:,}")
        st.markdown("**Precio promedio**")
        st.write(f"{precio_prom_total:0.2f}")
        st.markdown("**Costo promedio**")
        st.write(f"{costo_prom_total:0.2f}")

    with col2:
        # gráfico matplotlib
        fig, ax = plt.subplots(figsize=(8, 3))
        meses = grup["mes"].astype(float)
        ax.plot(meses, grup["precio_prom"], marker="o", color="#1f77b4", label="Precio promedio")
        ax.plot(meses, grup["costo_prom"], marker="o", color="#d62728", label="Costo promedio")
        ax.set_xlabel("Mes")
        ax.set_ylabel("Monto")
        ax.set_title("Evolución de precio y costo promedio")
        ax.legend(loc="best")
        ax.grid(True, linestyle='--', alpha=0.3)
        st.pyplot(fig)
        plt.close(fig)

    st.markdown("</div>", unsafe_allow_html=True)