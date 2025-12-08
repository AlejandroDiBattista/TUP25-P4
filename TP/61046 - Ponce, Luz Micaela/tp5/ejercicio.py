import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import calendar

st.set_page_config(page_title="Reporte de productos", layout="wide")


st.sidebar.title("Configuración")
uploaded_file = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])

df = None
available_years = []

if uploaded_file is not None:
    try:
        df = pd.read_csv(uploaded_file)

        expected_cols = {"año","mes","producto","cantidad","ingreso","costo"}
        if not expected_cols.issubset(set(df.columns)):
            st.sidebar.error(f"El CSV debe tener las columnas: {', '.join(expected_cols)}")
            st.stop()

        if "ano" in df.columns and "año" not in df.columns:
            df = df.rename(columns={"ano":"año"})

        df["año"] = df["año"].astype(int)
        df["mes"] = df["mes"].astype(int)
        df["cantidad"] = pd.to_numeric(df["cantidad"], errors="coerce").fillna(0)
        df["ingreso"] = pd.to_numeric(df["ingreso"], errors="coerce").fillna(0.0)
        df["costo"] = pd.to_numeric(df["costo"], errors="coerce").fillna(0.0)

        available_years = sorted(df["año"].unique().tolist())
    except Exception as e:
        st.sidebar.error(f"No se pudo leer el CSV: {e}")
        st.stop()

# Selector de año en sidebar
if available_years:
    year_selected = st.sidebar.selectbox("Seleccioná un año", available_years)
else:
    # si no hay años (porque no cargó archivo), ponemos un valor nulo
    year_selected = None

# Validaciones
if uploaded_file is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

if year_selected is None:
    st.warning("No se detectaron años en el CSV.")
    st.stop()

# Filtrar por año seleccionado
df_year = df[df["año"] == year_selected]
if df_year.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

# Encabezado principal
st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")


grouped = df_year.groupby(["producto", "mes"]).agg({
    "cantidad": "sum",
    "ingreso": "sum",
    "costo": "sum"
}).reset_index()

# Lista de productos ordenada alfabéticamente
productos = sorted(grouped["producto"].unique())


for producto in productos:
    producto_df = grouped[grouped["producto"] == producto].copy()
    # Orden por mes
    producto_df = producto_df.sort_values("mes")

    # Cálculos globales por producto (del año)
    total_cantidad = producto_df["cantidad"].sum()
    total_ingreso = producto_df["ingreso"].sum()
    total_costo = producto_df["costo"].sum()

    # Evita división por cero
    precio_promedio_global = (total_ingreso / total_cantidad) if total_cantidad != 0 else 0.0
    costo_promedio_global = (total_costo / total_cantidad) if total_cantidad != 0 else 0.0

    # Contenedor con borde (estilizado vía HTML)
    st.markdown(
        f"""
        <div style="border:1px solid #ddd;padding:12px;border-radius:8px;margin-bottom:10px">
        <h2 style="color:#b30000">:red[{producto}]</h2>
        """,
        unsafe_allow_html=True
    )

    col1, col2 = st.columns([0.3, 0.7])

    # Columna de métricas
    with col1:
        st.write("**Cantidad de ventas**")
        st.write(f"{int(total_cantidad):,}")
        st.write("**Precio promedio**")
        st.write(f"${precio_promedio_global:,.2f}")
        st.write("**Costo promedio**")
        st.write(f"${costo_promedio_global:,.2f}")

    # Columna del gráfico
    with col2:

        meses = list(producto_df["mes"])
        cantidades_m = list(producto_df["cantidad"])

        precio_prom_m = []
        costo_prom_m = []
        meses_labels = []
        for _, row in producto_df.iterrows():
            mes = int(row["mes"])
            meses_labels.append(calendar.month_abbr[mes])
            q = row["cantidad"]
            ingreso = row["ingreso"]
            costo = row["costo"]
            if q != 0:
                precio_prom_m.append(ingreso / q)
                costo_prom_m.append(costo / q)
            else:
                precio_prom_m.append(0.0)
                costo_prom_m.append(0.0)


        fig, ax = plt.subplots(figsize=(8, 3))
        ax.plot(meses_labels, precio_prom_m, marker='o', linestyle='-', label='Precio promedio', color='#1f77b4')
        ax.plot(meses_labels, costo_prom_m, marker='o', linestyle='-', label='Costo promedio', color='#d62728')
        ax.set_xlabel("Mes")
        ax.set_ylabel("Monto")
        ax.set_title("Evolución de precio y costo promedio")
        ax.legend(loc='best')
        ax.grid(True, linestyle='--', alpha=0.3)

        st.pyplot(fig)


    st.markdown("</div>", unsafe_allow_html=True)
