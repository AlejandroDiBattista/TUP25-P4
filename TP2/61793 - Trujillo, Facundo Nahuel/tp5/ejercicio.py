import base64
from io import BytesIO

import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st
import textwrap


def to_image_base64(fig: plt.Figure) -> str:
	"""Convierte una figura matplotlib a un string base64 (PNG)."""
	buf = BytesIO()
	fig.savefig(buf, format="png", bbox_inches="tight")
	buf.seek(0)
	data = base64.b64encode(buf.read()).decode("utf-8")
	buf.close()
	return data


def validate_columns(df: pd.DataFrame):
	required = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
	missing = required - set(df.columns)
	if missing:
		raise ValueError(f"Faltan columnas requeridas: {', '.join(sorted(missing))}")


def prepare_dataframe(df: pd.DataFrame) -> pd.DataFrame:
	# Normalizar nombres de columnas (por si vienen con espacios)
	df = df.copy()
	df.columns = [c.strip() for c in df.columns]

	validate_columns(df)

	# Convertir tipos
	df["año"] = pd.to_numeric(df["año"], errors="coerce").astype("Int64")
	df["mes"] = pd.to_numeric(df["mes"], errors="coerce").astype("Int64")
	df["cantidad"] = pd.to_numeric(df["cantidad"], errors="coerce").fillna(0)
	df["ingreso"] = pd.to_numeric(df["ingreso"], errors="coerce").fillna(0.0)
	df["costo"] = pd.to_numeric(df["costo"], errors="coerce").fillna(0.0)

	# Eliminar filas sin producto
	df = df[df["producto"].notna()]

	return df


def calculate_metrics(product_df: pd.DataFrame) -> dict:
	total_sales = int(product_df["cantidad"].sum())
	total_ingreso = float(product_df["ingreso"].sum())
	total_costo = float(product_df["costo"].sum())

	# Evitar división por cero
	if total_sales == 0:
		average_price = 0.0
		average_cost = 0.0
	else:
		average_price = total_ingreso / total_sales
		average_cost = total_costo / total_sales

	return {
		"total_sales": total_sales,
		"average_price": average_price,
		"average_cost": average_cost,
	}


def plot_price_cost_fig(product_df: pd.DataFrame) -> plt.Figure:
	# Agrupar por mes y calcular precio/costo promedio = sum(ingreso)/sum(cantidad)
	grp = product_df.groupby("mes").agg({"ingreso": "sum", "costo": "sum", "cantidad": "sum"}).reset_index()
	# evitar divisiones por cero
	grp = grp[grp["cantidad"] > 0].copy()
	if grp.empty:
		fig, ax = plt.subplots(figsize=(8, 3))
		ax.text(0.5, 0.5, "No hay datos por mes", ha="center", va="center")
		ax.axis("off")
		return fig

	grp["precio_promedio"] = grp["ingreso"] / grp["cantidad"]
	grp["costo_promedio"] = grp["costo"] / grp["cantidad"]

	grp = grp.sort_values("mes")

	fig, ax = plt.subplots(figsize=(8, 3))
	ax.plot(grp["mes"], grp["precio_promedio"], marker="o", color="#1f77b4", label="Precio promedio")
	ax.plot(grp["mes"], grp["costo_promedio"], marker="o", color="#d62728", label="Costo promedio")
	ax.set_xlabel("Mes")
	ax.set_ylabel("Monto")
	ax.set_title("Evolución de precio y costo promedio")
	ax.grid(linestyle="--", alpha=0.3)
	ax.legend(loc="best")

	return fig


def main():
	st.set_page_config(page_title="Reporte de productos", layout="wide")

	# Sidebar
	st.sidebar.title("Configuración")
	uploaded_file = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"]) 

	# Si no hay archivo: mensaje informativo y detener
	if uploaded_file is None:
		st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
		st.stop()

	# Cargar CSV
	try:
		df = pd.read_csv(uploaded_file)
	except Exception as e:
		st.error(f"Error leyendo el CSV: {e}")
		st.stop()

	try:
		df = prepare_dataframe(df)
	except Exception as e:
		st.error(str(e))
		st.stop()

	years_available = sorted(df["año"].dropna().unique())

	if not years_available:
		st.warning("El archivo no contiene años válidos.")
		st.stop()

	year = st.sidebar.selectbox("Seleccioná un año", options=years_available)

	# Filtrar por año
	filtered = df[df["año"] == int(year)].copy()

	if filtered.empty:
		st.warning("El año seleccionado no tiene datos para mostrar.")
		st.stop()

	# Encabezado principal
	st.title("Informe de Productos 📈")
	st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

	# Iterar productos ordenados alfabéticamente
	productos = sorted(filtered["producto"].dropna().unique())

	for producto in productos:
		product_df = filtered[filtered["producto"] == producto]
		metrics = calculate_metrics(product_df)

		# Crear figura y convertir a imagen base64
		fig = plot_price_cost_fig(product_df)
		img_b64 = to_image_base64(fig)

		# Renderizar contenedor con estilo que imita la referencia (sombra, bordes y columnas 30/70)
		# Wrapper div to provide border/shadow; title and content use Streamlit native components
		st.markdown("""
		<div style='border:1px solid #e0e0e0;padding:16px;border-radius:8px;margin-bottom:16px;box-shadow:0 2px 6px rgba(0,0,0,0.06);background:#fff;'>
		""", unsafe_allow_html=True)

		# Render product title as markdown so the :red[] formatting is applied
		st.markdown(f"## :red[{producto}]")

		# Two columns: 30% left for metrics, 70% right for the plot
		col1, col2 = st.columns([0.3, 0.7])
		with col1:
			# Metrics formatted per spec
			st.write("Cantidad de ventas")
			st.markdown(f"**{metrics['total_sales']:,}**")
			st.write("Precio promedio")
			st.markdown(f"**${metrics['average_price']:.2f}**")
			st.write("Costo promedio")
			st.markdown(f"**${metrics['average_cost']:.2f}**")

		with col2:
			# Show the matplotlib figure
			st.pyplot(fig)

		# Close wrapper div
		st.markdown("""
		</div>
		""", unsafe_allow_html=True)


if __name__ == "__main__":
	main()