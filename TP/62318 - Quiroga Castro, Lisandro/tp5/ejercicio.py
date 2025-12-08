import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt


st.set_page_config(page_title="Reporte de productos", layout="wide")


st.sidebar.title("Configuración")

uploaded_file = st.sidebar.file_uploader(
    label="Seleccioná un CSV",
    type=["csv"]
)


if uploaded_file is not None:
    try:
        df = pd.read_csv(uploaded_file)
    except Exception as e:
        st.sidebar.error(f"No se pudo leer el CSV: {e}")
        st.stop()
else:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()


expected_cols = ["año", "mes", "producto", "cantidad", "ingreso", "costo"]
if not all(col in df.columns for col in expected_cols):
    st.error(f"El archivo CSV debe contener las columnas: {expected_cols}")
    st.stop()


df["año"] = df["año"].astype(int)
df["mes"] = df["mes"].astype(int)

df["producto"] = df["producto"].astype(str)
df["cantidad"] = pd.to_numeric(df["cantidad"], errors="coerce")
df["ingreso"]   = pd.to_numeric(df["ingreso"],   errors="coerce")
df["costo"]     = pd.to_numeric(df["costo"],     errors="coerce")


years = sorted(df["año"].dropna().unique().tolist())
selected_year = st.sidebar.selectbox("Seleccioná un año", years)


df_year = df[df["año"] == selected_year]
if df_year.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()


st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes")


productos = sorted(df_year["producto"].unique().tolist())

for producto in productos:
    df_prod = df_year[df_year["producto"] == producto]
    
    cantidad_total = df_prod["cantidad"].sum()
    ingreso_total  = df_prod["ingreso"].sum()
    costo_total    = df_prod["costo"].sum()
    precio_promedio = ingreso_total / cantidad_total if cantidad_total else 0
    costo_promedio = costo_total / cantidad_total   if cantidad_total else 0

    
    st.markdown(f"## :red[{producto}]")
    cols = st.columns([0.3, 0.7])

    with cols[0]:
        st.write(f"**Cantidad de ventas**: {int(cantidad_total):,}")
        st.write(f"**Precio medio**: ${precio_promedio:,.2f}")
        st.write(f"**Costo promedio**: ${costo_promedio:,.2f}")

    with cols[1]:
        
        df_monthly = (
            df_prod
            .groupby("mes", as_index=True)
            .agg({
                "cantidad": "sum",
                "ingreso":  "sum",
                "costo":    "sum"
            })
            .sort_index()
        )
        
        df_monthly["precio_promedio"] = df_monthly["ingreso"] / df_monthly["cantidad"]
        df_monthly["costo_promedio"]  = df_monthly["costo"]   / df_monthly["cantidad"]

        
        fig, ax = plt.subplots(figsize=(8, 3))
        ax.plot(df_monthly.index, df_monthly["precio_promedio"],
                color="#1f77b4", marker="o", label="Precio promedio")
        ax.plot(df_monthly.index, df_monthly["costo_promedio"],
                color="#d62728", marker="o", label="Costo promedio")
        ax.set_title("Evolución de precio y costo promedio")
        ax.set_xlabel("Mes")
        ax.set_ylabel("Monto")
        ax.grid(True, linestyle="--", alpha=0.3)
        ax.legend(loc="best")

        st.pyplot(fig)

        plt.close(fig)
