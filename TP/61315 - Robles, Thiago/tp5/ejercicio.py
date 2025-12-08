import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

# 1) Configuración de la página
st.set_page_config(page_title="Reporte de productos", layout="wide")

# ---------------------------------------------
# 2) Barra lateral (sidebar)
# ---------------------------------------------
st.sidebar.title("Configuración")
archivo = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])

# 3) Validación: sin archivo
if not archivo:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

# Cargar CSV
try:
    df = pd.read_csv(archivo)
except Exception as e:
    st.error(f"No se pudo leer el archivo CSV. Detalle: {e}")
    st.stop()

# Normalizar nombres de columnas esperadas
columnas_esperadas = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
faltantes = columnas_esperadas.difference(df.columns)
if faltantes:
    st.error(
        f"El CSV no contiene las columnas requeridas: {', '.join(sorted(faltantes))}"
    )
    st.stop()

# Tipos y limpieza básica
df = df.copy()
df["año"] = pd.to_numeric(df["año"], errors="coerce").astype("Int64")
df["mes"] = pd.to_numeric(df["mes"], errors="coerce").astype("Int64")
df["cantidad"] = pd.to_numeric(df["cantidad"], errors="coerce").fillna(0)
df["ingreso"] = pd.to_numeric(df["ingreso"], errors="coerce").fillna(0.0)
df["costo"] = pd.to_numeric(df["costo"], errors="coerce").fillna(0.0)
df["producto"] = df["producto"].astype(str).str.strip()

# Años disponibles
anios = sorted([int(a) for a in df["año"].dropna().unique()])
anio_sel = st.sidebar.selectbox("Seleccioná un año", options=anios if anios else [])

# 3) Validación: año sin datos
df_anio = df[df["año"] == anio_sel] if len(df) else pd.DataFrame(columns=df.columns)
if df_anio.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

# ---------------------------------------------
# 4) Encabezado principal
# ---------------------------------------------
st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

# ---------------------------------------------
# 5) Visualización por producto
# ---------------------------------------------
productos = sorted(df_anio["producto"].dropna().unique())

for prod in productos:
    cont = st.container(border=True)
    with cont:
        st.markdown(f"## :red[{prod}]")

        dfp = df_anio[df_anio["producto"] == prod].copy()

        # 6) Cálculos requeridos
        total_cantidad = dfp["cantidad"].sum()
        total_ingreso = dfp["ingreso"].sum()
        total_costo = dfp["costo"].sum()

        # Promedios ponderados por cantidad (ingreso/cantidad y costo/cantidad)
        precio_prom = (total_ingreso / total_cantidad) if total_cantidad else 0.0
        costo_prom = (total_costo / total_cantidad) if total_cantidad else 0.0

        col_izq, col_der = st.columns([0.3, 0.7])

        # Columna izquierda: métricas
        with col_izq:
            st.markdown("**Cantidad de ventas:** ")
            st.markdown(f"{total_cantidad:,.0f}")
            st.markdown("**Precio promedio:** ")
            st.markdown(f"{precio_prom:,.2f}")
            st.markdown("**Costo promedio:** ")
            st.markdown(f"{costo_prom:,.2f}")

        # Columna derecha: gráfico de evolución mensual
        with col_der:
            # Agregar métricas mensuales
            g = (
                dfp.groupby("mes", as_index=False)
                .agg({"ingreso": "sum", "costo": "sum", "cantidad": "sum"})
                .sort_values("mes")
            )
            # Evitar división por cero
            g["precio_prom"] = g.apply(
                lambda r: (r["ingreso"] / r["cantidad"]) if r["cantidad"] else 0.0,
                axis=1,
            )
            g["costo_prom"] = g.apply(
                lambda r: (r["costo"] / r["cantidad"]) if r["cantidad"] else 0.0, axis=1
            )

            # Plot con Matplotlib
            fig, ax = plt.subplots(figsize=(8, 3))
            ax.plot(
                g["mes"],
                g["precio_prom"],
                color="#1f77b4",
                marker="o",
                label="Precio promedio",
            )
            ax.plot(
                g["mes"],
                g["costo_prom"],
                color="#d62728",
                marker="o",
                label="Costo promedio",
            )
            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            ax.set_title("Evolución de precio y costo promedio")
            ax.legend(loc="best")
            ax.grid(True, linestyle=":", alpha=0.3)
            fig.tight_layout()
            st.pyplot(fig)


