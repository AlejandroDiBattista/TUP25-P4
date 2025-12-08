from __future__ import annotations

import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st
import numpy as np

st.set_page_config(page_title="Reporte de productos", layout="wide")

st.sidebar.title("Configuración")
year_select_placeholder = st.sidebar.empty()
uploaded_file = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])

if uploaded_file is None:
    year_select_placeholder.selectbox(
        "Seleccioná un año", options=["Seleccioná un año"], index=0, disabled=True
    )
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

try:
    data = pd.read_csv(uploaded_file)
except Exception as exc:
    st.error(f"No se pudo leer el archivo provisto: {exc}")
    st.stop()

data.columns = data.columns.str.strip()
required_columns = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
missing_columns = required_columns - set(data.columns)

if missing_columns:
    st.error(
        "El archivo CSV no contiene las columnas requeridas: "
        + ", ".join(sorted(missing_columns))
    )
    st.stop()

numeric_fields = ["año", "mes", "cantidad", "ingreso", "costo"]

for field in numeric_fields:
    data[field] = pd.to_numeric(data[field], errors="coerce")

data = data.dropna(subset=numeric_fields + ["producto"])
data["año"] = data["año"].astype(int)
data["mes"] = data["mes"].astype(int)

available_years = sorted(data["año"].unique().tolist())

if not available_years:
    st.warning("El archivo no posee datos válidos para mostrar.")
    st.stop()

selected_year = year_select_placeholder.selectbox(
    "Seleccioná un año", options=available_years
)

filtered_data = data[data["año"] == selected_year]

if filtered_data.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

st.title("Informe de Productos")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

products = sorted(filtered_data["producto"].unique())

def safe_divide(numerator: float, denominator: float) -> float:
    if denominator == 0 or pd.isna(denominator):
        return np.nan
    return numerator / denominator

def format_number(value: float, decimals: int = 0) -> str:
    if pd.isna(value):
        return "-"
    if decimals == 0:
        return f"{int(round(value)):,}"
    return f"{value:,.{decimals}f}"

for product in products:
    product_data = filtered_data[filtered_data["producto"] == product]
    total_quantity = product_data["cantidad"].sum()
    total_income = product_data["ingreso"].sum()
    total_cost = product_data["costo"].sum()

    avg_price = safe_divide(total_income, total_quantity)
    avg_cost = safe_divide(total_cost, total_quantity)

    monthly = (
        product_data.groupby("mes", as_index=False)
        .agg(cantidad=("cantidad", "sum"), ingreso=("ingreso", "sum"), costo=("costo", "sum"))
        .sort_values("mes")
    )

    monthly["precio_promedio"] = monthly.apply(
        lambda row: safe_divide(row["ingreso"], row["cantidad"]), axis=1
    )
    monthly["costo_promedio"] = monthly.apply(
        lambda row: safe_divide(row["costo"], row["cantidad"]), axis=1
    )

    with st.container(border=True):
        st.markdown(f"## :red[{product}]")
        metrics_col, chart_col = st.columns([0.3, 0.7], gap="medium")

        metrics_col.metric("Cantidad de ventas", format_number(total_quantity))
        metrics_col.metric("Precio promedio", format_number(avg_price, 2))
        metrics_col.metric("Costo promedio", format_number(avg_cost, 2))

        with chart_col:
            fig, ax = plt.subplots(figsize=(8, 3))
            ax.plot(
                monthly["mes"],
                monthly["precio_promedio"],
                color="#1f77b4",
                marker="o",
                label="Precio promedio",
            )
            ax.plot(
                monthly["mes"],
                monthly["costo_promedio"],
                color="#d62728",
                marker="o",
                label="Costo promedio",
            )
            ax.set_title("Evolución de precio y costo promedio")
            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            ax.grid(True, linestyle="--", alpha=0.3)
            ax.legend(loc="best")
            chart_col.pyplot(fig)
            plt.close(fig)