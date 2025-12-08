import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")

st.sidebar.title("Configuración")
uploaded = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"]) 

if uploaded is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

try:
    df = pd.read_csv(uploaded)
except Exception as e:
    st.sidebar.error(f"No se pudo leer el archivo CSV: {e}")
    st.stop()

df.columns = [c.lower().strip() for c in df.columns]

required_cols = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
cols_lower = set(df.columns)
if not required_cols.issubset(cols_lower):
    st.sidebar.error("El CSV debe contener las columnas: año, mes, producto, cantidad, ingreso, costo.")
    st.stop()

df["año"] = pd.to_numeric(df["año"], errors="coerce").astype(pd.Int64Dtype())
df["mes"] = df["mes"].astype(str).str.lstrip("0")
df["mes"] = pd.to_numeric(df["mes"], errors="coerce").astype(pd.Int64Dtype())
df["cantidad"] = pd.to_numeric(df["cantidad"], errors="coerce").fillna(0).astype(float)
df["ingreso"] = pd.to_numeric(df["ingreso"], errors="coerce").fillna(0.0)
df["costo"] = pd.to_numeric(df["costo"], errors="coerce").fillna(0.0)

años_disponibles = sorted(df["año"].dropna().unique())
if len(años_disponibles) == 0:
    st.sidebar.error("El archivo no contiene años válidos.")
    st.stop()

selected_year = st.sidebar.selectbox("Seleccioná un año", options=años_disponibles)

df_anio = df[df["año"] == selected_year]
if df_anio.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

def format_thousands_int(n):
    try:
        n_int = int(round(n))
        s = f"{n_int:,}"
        s = s.replace(",", "X").replace(".", ",").replace("X", ".")
        return s
    except Exception:
        return str(n)

def format_money_es(n):
    try:
        s = f"{n:,.2f}"
        s = s.replace(",", "X").replace(".", ",").replace("X", ".")
        return f"${s}"
    except Exception:
        return str(n)

productos = sorted(df_anio["producto"].dropna().unique())

for producto in productos:
    cont_html_start = "<div style='border:1px solid #e6e6e6; padding:18px; border-radius:8px; margin-bottom:20px;'>"
    cont_html_end = "</div>"
    st.markdown(cont_html_start, unsafe_allow_html=True)
    st.markdown(f"## :red[{producto}]")
    col1, col2 = st.columns([0.3, 0.7])
    df_prod = df_anio[df_anio["producto"] == producto]
    monthly = (
        df_prod.groupby("mes", as_index=False)
        .agg({"cantidad": "sum", "ingreso": "sum", "costo": "sum"})
        .set_index("mes")
        .reindex(range(1, 13), fill_value=0)
        .reset_index()
    )

    def safe_div(row, num_col, den_col):
        den = row[den_col]
        return (row[num_col] / den) if den != 0 else 0.0

    monthly["precio_prom"] = monthly.apply(lambda r: safe_div(r, "ingreso", "cantidad"), axis=1)
    monthly["costo_prom"] = monthly.apply(lambda r: safe_div(r, "costo", "cantidad"), axis=1)

    total_cantidad = df_prod["cantidad"].sum()
    precio_promedio_global = (df_prod["ingreso"].sum() / total_cantidad) if total_cantidad != 0 else 0.0
    costo_promedio_global = (df_prod["costo"].sum() / total_cantidad) if total_cantidad != 0 else 0.0

    with col1:
        st.write("**Cantidad de ventas**")
        st.write(format_thousands_int(total_cantidad))
        st.write("**Precio promedio**")
        st.write(format_money_es(precio_promedio_global))
        st.write("**Costo promedio**")
        st.write(format_money_es(costo_promedio_global))

    with col2:
        fig, ax = plt.subplots(figsize=(8, 3))
        meses = monthly["mes"]
        ax.plot(meses, monthly["precio_prom"], marker="o", label="Precio promedio", color="#1f77b4")
        ax.plot(meses, monthly["costo_prom"], marker="o", label="Costo promedio", color="#d62728")
        ax.set_xlabel("Mes")
        ax.set_ylabel("Monto")
        ax.set_title("Evolución de precio y costo promedio")
        ax.legend(loc="best")
        ax.grid(True, linestyle=":", alpha=0.3)
        ax.set_xticks(range(1, 13))
        st.pyplot(fig)

    st.markdown(cont_html_end, unsafe_allow_html=True)

st.write("---")
st.write(f"Datos mostrados para el año **{selected_year}**. Archivo cargado: **{uploaded.name}**")