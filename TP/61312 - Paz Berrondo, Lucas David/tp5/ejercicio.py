import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st
import io

st.set_page_config(page_title="Reporte de productos", layout="wide")


def formatear_miles(n):
	try:
		return f"{int(n):,}"
	except Exception:
		return "0"


def main():
	# Sidebar
	st.sidebar.title("Configuración")
	uploaded = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"] )

	# Cargar datos si hay archivo
	if uploaded is None:
		st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
		return

	# Leemos CSV con pandas
	try:
		# soportar tanto objetos file como bytes
		if isinstance(uploaded, (bytes, bytearray)):
			uploaded_io = io.BytesIO(uploaded)
			df = pd.read_csv(uploaded_io)
		else:
			df = pd.read_csv(uploaded)
	except Exception as e:
		st.error("No se pudo leer el archivo CSV. Verificá el formato.")
		return

	# Normalizar columnas esperadas y tipado
	expected = ["año", "mes", "producto", "cantidad", "ingreso", "costo"]
	# Aceptar mayúsculas o espacios extra: buscar coincidencias
	lower_cols = {c.lower().strip(): c for c in df.columns}
	if not all(col in lower_cols for col in expected):
		# intentar renombrar columnas si vienen en otro orden o con nombres similares
		# map exact lowercase names
		rename_map = {}
		for col in df.columns:
			key = col.lower().strip()
			if key in expected:
				rename_map[col] = key
		df = df.rename(columns=rename_map)

	# Asegurar columnas necesarias
	if not all(col in df.columns for col in expected):
		st.error("El CSV debe contener las columnas: año, mes, producto, cantidad, ingreso, costo.")
		return

	# Convertir tipos
	df = df[expected].copy()
	df["año"] = df["año"].astype(int)
	# Normalizar mes a int (acepta '01' y '1')
	df["mes"] = df["mes"].astype(str).str.zfill(2).str.slice(0,2).astype(int)
	df["producto"] = df["producto"].astype(str)
	df["cantidad"] = pd.to_numeric(df["cantidad"], errors="coerce").fillna(0)
	df["ingreso"] = pd.to_numeric(df["ingreso"], errors="coerce").fillna(0.0)
	df["costo"] = pd.to_numeric(df["costo"], errors="coerce").fillna(0.0)

	# Selector de año en sidebar
	años = sorted(df["año"].unique())
	año_sel = st.sidebar.selectbox("Seleccioná un año", años)

	# Filtrar por año
	df_a = df[df["año"] == año_sel]
	if df_a.empty:
		st.warning("El año seleccionado no tiene datos para mostrar.")
		return

	# Encabezado principal
	st.title("Informe de Productos 📈")
	st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

	# Preparar productos ordenados alfabéticamente
	productos = sorted(df_a["producto"].unique(), key=lambda s: s.lower())

	for producto in productos:
		cont = st.container()
		# contenedor con borde: usamos st.markdown con estilo mínimo
		cont.markdown("<div style='border:1px solid #e6e6e6; padding:16px; border-radius:6px; margin-bottom:16px;'>", unsafe_allow_html=True)
		cont.markdown(f"## :red[{producto}]")

		left_col, right_col = cont.columns([0.3, 0.7])

		df_p = df_a[df_a["producto"] == producto]

		# Cálculos: totales y promedios mensuales
		suma_cantidad = int(df_p["cantidad"].sum())
		# Para precio y costo promedio general: usar suma(ingreso)/suma(cantidad)
		precio_promedio_global = df_p["ingreso"].sum() / df_p["cantidad"].sum() if df_p["cantidad"].sum() != 0 else 0
		costo_promedio_global = df_p["costo"].sum() / df_p["cantidad"].sum() if df_p["cantidad"].sum() != 0 else 0

		with left_col:
			cont.metric(label="Cantidad de ventas", value=formatear_miles(suma_cantidad))
			st.write("")
			st.write(f"Precio promedio\n${precio_promedio_global:,.2f}")
			st.write("")
			st.write(f"Costo promedio\n${costo_promedio_global:,.2f}")

		# Gráfico en la columna derecha
		# Agrupar por mes y calcular precio medio y costo medio como ingreso/cantidad y costo/cantidad promedio por mes
		df_month = df_p.groupby("mes").agg({
			"cantidad": "sum",
			"ingreso": "sum",
			"costo": "sum",
		}).reset_index()

		df_month = df_month.sort_values("mes")
		# calcular promedios mensuales (ingreso/cantidad, costo/cantidad)
		df_month["precio_promedio"] = df_month.apply(lambda r: (r["ingreso"] / r["cantidad"]) if r["cantidad"] != 0 else 0, axis=1)
		df_month["costo_promedio"] = df_month.apply(lambda r: (r["costo"] / r["cantidad"]) if r["cantidad"] != 0 else 0, axis=1)

		# Plot
		fig, ax = plt.subplots(figsize=(8, 3))
		ax.plot(df_month["mes"], df_month["precio_promedio"], marker='o', color="#1f77b4", label="Precio promedio")
		ax.plot(df_month["mes"], df_month["costo_promedio"], marker='o', color="#d62728", label="Costo promedio")
		ax.set_xlabel("Mes")
		ax.set_ylabel("Monto")
		ax.set_title("Evolución de precio y costo promedio")
		ax.legend(loc='best')
		ax.grid(linestyle='--', alpha=0.3)

		with right_col:
			st.pyplot(fig)

		cont.markdown("</div>", unsafe_allow_html=True)


if __name__ == "__main__":
	main()
