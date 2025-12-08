# TP5 - Análisis de Datos con Streamlit
# Requisitos: Python 3.x, streamlit, pandas, matplotlib
# Ejecutar con: streamlit run tp5_streamlit_reporte_productos.py

import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt

# -----------------------------
# 1) Configuración de la página
# -----------------------------
st.set_page_config(page_title="Reporte de productos", layout="wide")

# -----------------------------
# Helpers de formateo
# -----------------------------
def formato_miles(x: float) -> str:
    """Devuelve un entero con separador de miles usando punto."""
    try:
        return f"{int(round(x)):,}".replace(",", ".")
    except Exception:
        return str(x)

def formato_moneda(x: float, decimales: int = 2) -> str:
    """Formatea con coma como separador decimal y punto de miles."""
    try:
        s = f"{x:,.{decimales}f}"
        return s.replace(",", "X").replace(".", ",").replace("X", ".")
    except Exception:
        return str(x)

# -----------------------------
# 2) Barra lateral (sidebar)
# -----------------------------
st.sidebar.title("Configuración")
archivo = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])

# Preparamos el selector de año cuando haya datos
df = None
anios = []

if archivo is not None:
    try:
        df = pd.read_csv(archivo)
    except Exception as e:
        st.sidebar.error(f"Error al leer el CSV: {e}")
        df = None

    # Validamos columnas requeridas
    columnas_requeridas = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
    if df is not None and not columnas_requeridas.issubset(df.columns):
        faltan = columnas_requeridas - set(df.columns)
        st.sidebar.error(f"El CSV no contiene las columnas requeridas: {', '.join(sorted(faltan))}")
        df = None

    if df is not None:
        # Tipos mínimos y limpieza suave
        for c in ["año", "mes", "cantidad", "ingreso", "costo"]:
            if c in df.columns:
                df[c] = pd.to_numeric(df[c], errors="coerce")
        if "producto" in df.columns:
            df["producto"] = df["producto"].astype(str).str.strip()

        # Quitamos filas sin datos clave
        df = df.dropna(subset=["año", "mes", "producto", "cantidad", "ingreso", "costo"])

        # Aseguramos enteros donde corresponde (sin cambiar cálculos)
        df["año"] = df["año"].astype(int)
        df["mes"] = df["mes"].astype(int)

        # Años disponibles ordenados
        anios = sorted(df["año"].dropna().unique().astype(int).tolist())

anio_sel = st.sidebar.selectbox("Seleccioná un año", options=anios) if anios else None

# -----------------------------
# 3) Validaciones
# -----------------------------
if df is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

if anio_sel is None:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

# Filtramos por año
df_year = df[df["año"] == anio_sel].copy()
if df_year.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

# ---------------------------------
# 4) Encabezado principal de página
# ---------------------------------
st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

# ---------------------------------
# 5) Visualización por producto
# ---------------------------------
# Calculamos promedio por registro (auxiliar)
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
            st.write(formato_moneda(precio_promedio))
            st.markdown("**Costo promedio**")
            st.write(formato_moneda(costo_promedio))

        with col_g:
            grp = (
                data_p.groupby("mes", as_index=False)
                .agg({"cantidad": "sum", "ingreso": "sum", "costo": "sum"})
                .sort_values("mes")
            )
            grp["precio_prom"] = grp.apply(
                lambda r: (r["ingreso"] / r["cantidad"]) if r["cantidad"] != 0 else 0.0, axis=1
            )
            grp["costo_prom"] = grp.apply(
                lambda r: (r["costo"] / r["cantidad"]) if r["cantidad"] != 0 else 0.0, axis=1
            )

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
