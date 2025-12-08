import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st



st.set_page_config(page_title="Reporte de productos", layout="wide")

st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")
st.write("Escribir acá la solución del TP5")

#  CARGA DE ARCHIVO 
archivo = st.sidebar.file_uploader("📂 Subí el archivo CSV", type=["csv"])

# Si no hay archivo, mostrar mensaje
if archivo is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

#  LECTURA DEL CSV 
try:
    df = pd.read_csv(archivo)
except Exception as e:
    st.error(f"No se pudo leer el CSV: {e}")
    st.stop()

#  VALIDACIÓN DE COLUMNAS 
requeridas = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
if not requeridas.issubset(df.columns):
    st.error(f"El CSV debe tener las columnas: {', '.join(requeridas)}")
    st.stop()

#  PREPARACIÓN DE DATOS 
for col in ["año", "mes"]:
    df[col] = pd.to_numeric(df[col], errors="coerce")

for col in ["cantidad", "ingreso", "costo"]:
    df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

#  SELECTOR DE AÑO 
años = sorted(df["año"].dropna().unique())
if len(años) == 0:
    st.warning("El archivo no contiene años válidos para mostrar.")
    st.stop()

año_sel = st.sidebar.selectbox("Seleccioná un año", años)

# Filtramos por año
df_año = df[df["año"] == año_sel]
if df_año.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

#  PROCESO POR PRODUCTO 
productos = sorted(df_año["producto"].dropna().unique())

for prod in productos:
    st.markdown(
        "<div style='border:1px solid #e6e6e6; padding:18px; border-radius:8px; margin-bottom:18px;'>",
        unsafe_allow_html=True,
    )

    st.markdown(f"## <span style='color:#b71c1c'>{prod}</span>", unsafe_allow_html=True)

    col1, col2 = st.columns([0.3, 0.7])

    df_prod = df_año[df_año["producto"] == prod]

    # Cálculos totales
    cant_total = df_prod["cantidad"].sum()
    ingreso_total = df_prod["ingreso"].sum()
    costo_total = df_prod["costo"].sum()

    precio_prom = ingreso_total / cant_total if cant_total != 0 else 0
    costo_prom = costo_total / cant_total if cant_total != 0 else 0

    # Columna izquierda
    with col1:
        st.write("**Cantidad de ventas**")
        st.markdown(f"<h2>{cant_total:,.0f}</h2>", unsafe_allow_html=True)
        st.write("**Precio promedio**")
        st.markdown(f"<h3>${precio_prom:,.2f}</h3>", unsafe_allow_html=True)
        st.write("**Costo promedio**")
        st.markdown(f"<h3>${costo_prom:,.2f}</h3>", unsafe_allow_html=True)

    # Columna derecha - gráfico
    with col2:
        mensual = (
            df_prod.groupby("mes")
            .agg({"cantidad": "sum", "ingreso": "sum", "costo": "sum"})
            .reset_index()
        )
        mensual["precio_promedio"] = mensual.apply(
            lambda x: x["ingreso"] / x["cantidad"] if x["cantidad"] != 0 else None, axis=1
        )
        mensual["costo_promedio"] = mensual.apply(
            lambda x: x["costo"] / x["cantidad"] if x["cantidad"] != 0 else None, axis=1
        )

        fig, ax = plt.subplots(figsize=(8, 3))
        ax.plot(mensual["mes"], mensual["precio_promedio"], "o-", color="#1f77b4", label="Precio promedio")
        ax.plot(mensual["mes"], mensual["costo_promedio"], "o-", color="#d62728", label="Costo promedio")
        ax.set_title("Evolución de precio y costo promedio")
        ax.set_xlabel("Mes")
        ax.set_ylabel("Monto")
        ax.grid(True, linestyle="--", alpha=0.3)
