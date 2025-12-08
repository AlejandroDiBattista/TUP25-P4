import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")


def main():
	# Barra lateral
	st.sidebar.title("Configuración")
	uploaded = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])

	# Si no hay archivo cargado, pedir al usuario que suba uno y detener
	if uploaded is None:
		st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
		st.stop()

	# Intentar leer el CSV
	try:
		df = pd.read_csv(uploaded)
	except Exception as e:
		st.error(f"No se pudo leer el CSV: {e}")
		st.stop()

	# Verificar columnas requeridas
	required = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
	if not required.issubset(set(df.columns)):
		st.error(f"El CSV debe contener las columnas: {', '.join(sorted(required))}")
		st.stop()

	# Normalizar tipos
	try:
		df = df.copy()
		df['año'] = df['año'].astype(int)
		df['mes'] = df['mes'].astype(int)
		df['cantidad'] = pd.to_numeric(df['cantidad'], errors='coerce').fillna(0)
		df['ingreso'] = pd.to_numeric(df['ingreso'], errors='coerce').fillna(0)
		df['costo'] = pd.to_numeric(df['costo'], errors='coerce').fillna(0)
	except Exception as e:
		st.error(f"Error al normalizar tipos: {e}")
		st.stop()

	years = sorted(df['año'].dropna().unique())
	if not years:
		st.warning("El archivo CSV no contiene años válidos.")
		st.stop()

	# Selector de año en la barra lateral
	year = st.sidebar.selectbox("Seleccioná un año", options=years)

	# Filtrar por año seleccionado
	df_year = df[df['año'] == int(year)]
	if df_year.empty:
		st.warning("El año seleccionado no tiene datos para mostrar.")
		st.stop()

	# Encabezado principal
	st.title("Informe de Productos 📈")
	st.caption("Métricas resumidas y evolución de precios/costos por año y mes")

	# Lista de productos ordenada alfabéticamente
	products = sorted(df_year['producto'].dropna().unique())

	for producto in products:
		prod_df = df_year[df_year['producto'] == producto]

		# Contenedor con borde (usando HTML/CSS)
		st.markdown(
			"<div style='border:1px solid #ddd;padding:12px;margin-bottom:12px;border-radius:8px'>",
			unsafe_allow_html=True,
		)

		# Título del producto (texto rojo)
		st.markdown(f"## <span style='color:red'>{producto}</span>", unsafe_allow_html=True)

		left_col, right_col = st.columns([0.3, 0.7])

		# Cálculos agregados
		total_cantidad = prod_df['cantidad'].sum()
		total_ingreso = prod_df['ingreso'].sum()
		total_costo = prod_df['costo'].sum()

		precio_promedio = total_ingreso / total_cantidad if total_cantidad != 0 else 0.0
		costo_promedio = total_costo / total_cantidad if total_cantidad != 0 else 0.0

		# Columna de métricas (izquierda)
		with left_col:
			st.write("**Cantidad de ventas**")
			# Mostrar con separador de miles
			try:
				qty_display = f"{int(round(total_cantidad)):,}"
			except Exception:
				qty_display = f"{total_cantidad:,}"
			st.write(qty_display)

			st.write("**Precio medio**")
			st.write(f"{precio_promedio:,.2f}")

			st.write("**Costo promedio**")
			st.write(f"{costo_promedio:,.2f}")

		# Columna de gráfico (derecha)
		with right_col:
			# Agrupar por mes
			monthly = (
				prod_df.groupby('mes')
				.agg({'cantidad': 'sum', 'ingreso': 'sum', 'costo': 'sum'})
				.sort_index()
			)

			months = list(range(1, 13))

			# Calcular promedios por mes
			monthly_precio = (monthly['ingreso'] / monthly['cantidad']).reindex(months)
			monthly_costo = (monthly['costo'] / monthly['cantidad']).reindex(months)

			# Reemplazar inf por NaN para evitar picos
			monthly_precio = monthly_precio.replace([np.inf, -np.inf], np.nan)
			monthly_costo = monthly_costo.replace([np.inf, -np.inf], np.nan)

			fig, ax = plt.subplots(figsize=(8, 3))
			ax.plot(months, monthly_precio, marker='o', color='#1f77b4', label='Precio promedio')
			ax.plot(months, monthly_costo, marker='o', color='#d62728', label='Costo promedio')
			ax.set_xlabel('Mes')
			ax.set_ylabel('Monto')
			ax.set_title('Evolución de precio y costo promedio')
			ax.legend(loc='best')
			ax.grid(linestyle='--', alpha=0.3)
			ax.set_xticks(months)

			st.pyplot(fig)

		st.markdown("</div>", unsafe_allow_html=True)


if __name__ == '__main__':
	main()