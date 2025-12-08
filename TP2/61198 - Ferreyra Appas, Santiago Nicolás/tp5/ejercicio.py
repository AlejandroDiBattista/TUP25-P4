import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")

st.sidebar.title("Configuración")
archivo = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])


df = None
anios = []
if archivo is not None:
    try:
        df = pd.read_csv(archivo)
    except Exception as e:
        st.sidebar.error(f"Error al leer el CSV: {e}")
        df = None


    columnas_requeridas = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
    if df is not None and not columnas_requeridas.issubset(set(df.columns)):
        faltan = columnas_requeridas - set(df.columns)
        st.sidebar.error(f"El CSV no contiene las columnas requeridas: {', '.join(sorted(faltan))}")
        df = None

    if df is not None:

        for c in ["año", "mes", "cantidad", "ingreso", "costo"]:
            if c in df.columns:
                df[c] = pd.to_numeric(df[c], errors="coerce")
        if "producto" in df.columns:
            df["producto"] = df["producto"].astype(str).str.strip()


        df = df.dropna(subset=["año", "mes", "producto", "cantidad", "ingreso", "costo"])


        anios = sorted(df["año"].dropna().unique().astype(int).tolist())

anio_sel = st.sidebar.selectbox("Seleccioná un año", options=anios) if anios else None


if df is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

if anio_sel is None:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()


df_year = df[df["año"] == anio_sel].copy()
if df_year.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()


st.title("Informe de Productos")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")


def formato_miles(x: float) -> str:
    try:
        return f"{int(round(x)):,}".replace(",", ".")
    except Exception:
        return str(x)


df_year["precio_prom_reg"] = df_year["ingreso"] / df_year["cantidad"]
df_year["costo_prom_reg"] = df_year["costo"] / df_year["cantidad"]

for producto in sorted(df_year["producto"].unique()):
    data_p = df_year[df_year["producto"] == producto].copy()

    total_cantidad = data_p["cantidad"].sum()
    total_ingreso = data_p["ingreso"].sum()
    total_costo = data_p["costo"].sum()

    precio_promedio = (total_ingreso / total_cantidad) if total_cantidad != 0 else 0.0
    costo_promedio = (total_costo / total_cantidad) if total_cantidad != 0 else 0.0

    with st.container(border=True):
        st.markdown(f"## :red[{producto}]")

        col_m, col_g = st.columns([0.3, 0.7], vertical_alignment="start")

        with col_m:
            st.markdown("**Cantidad de ventas**")
            st.write(formato_miles(total_cantidad))
            st.markdown("**Precio promedio**")
            st.write(f"{precio_promedio:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))
            st.markdown("**Costo promedio**")
            st.write(f"{costo_promedio:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))

        with col_g:
            grp = data_p.groupby("mes", as_index=False).agg({
                "cantidad": "sum",
                "ingreso": "sum",
                "costo": "sum",
            })
            grp["precio_prom"] = grp.apply(lambda r: (r["ingreso"] / r["cantidad"]) if r["cantidad"] != 0 else 0.0, axis=1)
            grp["costo_prom"]  = grp.apply(lambda r: (r["costo"] / r["cantidad"]) if r["cantidad"] != 0 else 0.0, axis=1)
            grp = grp.sort_values("mes")

            fig = plt.figure(figsize=(8, 3))
            ax = fig.add_subplot(111)
            ax.plot(grp["mes"], grp["precio_prom"], marker="o", linestyle="-", color="#1f77b4", label="Precio promedio")
            ax.plot(grp["mes"], grp["costo_prom"], marker="o", linestyle="-", color="#d62728", label="Costo promedio")
            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            ax.set_title("Evolución de precio y costo promedio")
            ax.legend(loc="best")
            ax.grid(True, linestyle="--", alpha=0.3)
            st.pyplot(fig)