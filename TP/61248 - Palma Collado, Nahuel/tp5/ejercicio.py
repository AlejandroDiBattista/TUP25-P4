import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")

st.sidebar.title("Configuración")
uploaded_file = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])

if uploaded_file is None:
	st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
	st.stop()

data = pd.read_csv(uploaded_file)
required_columns = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
missing_columns = required_columns.difference(data.columns)

if missing_columns:
	st.error(
		"El archivo no contiene las columnas requeridas: "
		+ ", ".join(sorted(missing_columns))
	)
	st.stop()

# Convertimos columnas a tipos numéricos válidos para asegurar cálculos consistentes.
data["año"] = pd.to_numeric(data["año"], errors="coerce").astype("Int64")
data["cantidad"] = pd.to_numeric(data["cantidad"], errors="coerce")
data["ingreso"] = pd.to_numeric(data["ingreso"], errors="coerce")
data["costo"] = pd.to_numeric(data["costo"], errors="coerce")
data["mes_num"] = pd.to_numeric(data["mes"], errors="coerce")
data["producto"] = data["producto"].astype(str)

data = data.dropna(subset=["año", "producto", "cantidad", "ingreso", "costo"])

year_options = sorted(data["año"].dropna().unique())

if not year_options:
	st.error("No se encontraron años válidos en el archivo proporcionado.")
	st.stop()

selected_year = st.sidebar.selectbox("Seleccioná un año", year_options)

filtered_data = data[data["año"] == selected_year]

if filtered_data.empty:
	st.warning("El año seleccionado no tiene datos para mostrar.")
	st.stop()

st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

product_names = sorted(filtered_data["producto"].unique())

for product in product_names:
	product_data = filtered_data[filtered_data["producto"] == product]

	total_quantity = product_data["cantidad"].sum()
	total_income = product_data["ingreso"].sum()
	total_cost = product_data["costo"].sum()

	avg_price = total_income / total_quantity if total_quantity else np.nan
	avg_cost = total_cost / total_quantity if total_quantity else np.nan

	product_container = st.container(border=True)
	product_container.markdown(f"## :red[{product}]")

	col_metrics, col_chart = product_container.columns([0.3, 0.7])

	col_metrics.markdown(
		f"**Cantidad de ventas:** {total_quantity:,.0f}" if not pd.isna(total_quantity) else "**Cantidad de ventas:** -"
	)
	col_metrics.markdown(
		f"**Precio promedio:** {avg_price:,.2f}" if not pd.isna(avg_price) else "**Precio promedio:** -"
	)
	col_metrics.markdown(
		f"**Costo promedio:** {avg_cost:,.2f}" if not pd.isna(avg_cost) else "**Costo promedio:** -"
	)

	monthly = (
		product_data.groupby("mes", as_index=False)
		.agg({"cantidad": "sum", "ingreso": "sum", "costo": "sum", "mes_num": "first"})
	)

	monthly = monthly.sort_values(["mes_num", "mes"], na_position="first")

	monthly["precio_promedio"] = np.where(
		monthly["cantidad"] > 0,
		monthly["ingreso"] / monthly["cantidad"],
		np.nan,
	)
	monthly["costo_promedio"] = np.where(
		monthly["cantidad"] > 0,
		monthly["costo"] / monthly["cantidad"],
		np.nan,
	)

	fig, ax = plt.subplots(figsize=(8, 3))
	x_labels = monthly["mes"].astype(str)

	ax.plot(
		x_labels,
		monthly["precio_promedio"],
		color="#1f77b4",
		marker="o",
		label="Precio promedio",
	)
	ax.plot(
		x_labels,
		monthly["costo_promedio"],
		color="#d62728",
		marker="o",
		label="Costo promedio",
	)

	ax.set_xlabel("Mes")
	ax.set_ylabel("Monto")
	ax.set_title("Evolución de precio y costo promedio")
	ax.grid(True, linestyle="--", alpha=0.3)
	ax.legend()
	fig.tight_layout()

	col_chart.pyplot(fig)
	plt.close(fig)
