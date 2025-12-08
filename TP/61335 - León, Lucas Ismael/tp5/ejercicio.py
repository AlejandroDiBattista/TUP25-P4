import io
import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st


st.set_page_config(page_title="Reporte de productos", layout="wide")


def cargar_csv(uploaded_file):
	# lee el csv en un DataFrame y normaliza columnas
	try:
		df = pd.read_csv(uploaded_file)
	except Exception:
		# probar con decodificación explícita
		uploaded_file.seek(0)
		content = uploaded_file.read()
		if isinstance(content, bytes):
			content = content.decode('utf-8', errors='replace')
		df = pd.read_csv(io.StringIO(content))

	# Normalizar nombres de columnas (por si hay espacios u mayúsculas)
	df.columns = [c.strip() for c in df.columns]
	# Asegurar tipos básicos
	for col in ['año', 'mes']:
		if col in df.columns:
			df[col] = df[col].astype(str).str.zfill(2)

	return df


def formato_miles(x):
	return f"{int(x):,}".replace(',', '.')


def main():
	st.sidebar.title("Configuración")

	uploaded_file = st.sidebar.file_uploader("Seleccioná un CSV", type=['csv'])

	# Cargar dataframe sólo si hay archivo
	if uploaded_file is None:
		st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
		return

	df = cargar_csv(uploaded_file)

	# Validar columnas necesarias
	required = {'año', 'mes', 'producto', 'cantidad', 'ingreso', 'costo'}
	if not required.issubset(set(df.columns)):
		st.error(f"El CSV debe contener las columnas: {', '.join(sorted(required))}")
		return

	# Convertir tipos numéricos
	df['cantidad'] = pd.to_numeric(df['cantidad'], errors='coerce').fillna(0)
	df['ingreso'] = pd.to_numeric(df['ingreso'], errors='coerce').fillna(0)
	df['costo'] = pd.to_numeric(df['costo'], errors='coerce').fillna(0)

	# años disponibles ordenados
	años = sorted(df['año'].astype(str).unique())
	año_sel = st.sidebar.selectbox("Seleccioná un año", años) if años else None

	if uploaded_file and not años:
		st.warning("El año seleccionado no tiene datos para mostrar.")
		return

	# Filtrar por año
	df_sel = df[df['año'].astype(str) == str(año_sel)].copy()
	if df_sel.empty:
		st.warning("El año seleccionado no tiene datos para mostrar.")
		return

	st.markdown("# Informe de Productos 📈")
	st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

	# Preparar agrupaciones por producto y mes
	# Calcular precio promedio = ingreso / cantidad, costo promedio = costo / cantidad
	# primero agrupar por producto y mes
	df_sel['mes'] = df_sel['mes'].astype(str).str.zfill(2)

	productos = sorted(df_sel['producto'].astype(str).unique())

	for producto in productos:
		cont = st.container()
		with cont:
			st.markdown(f"## :red[{producto}]")
			# Datos del producto
			p_df = df_sel[df_sel['producto'] == producto].copy()

			# agrupar por mes (orden por mes numérico)
			ag = p_df.groupby('mes', sort=True).agg({'cantidad': 'sum', 'ingreso': 'sum', 'costo': 'sum'})
			ag = ag.sort_index()

			ag['precio_prom'] = ag['ingreso'] / ag['cantidad']
			ag['costo_prom'] = ag['costo'] / ag['cantidad']

			# Columnas: 0.3 y 0.7
			col1, col2 = st.columns([0.3, 0.7])
			with col1:
				total_cant = ag['cantidad'].sum()
				precio_promedio_total = (ag['ingreso'].sum() / ag['cantidad'].sum()) if ag['cantidad'].sum() else 0
				costo_promedio_total = (ag['costo'].sum() / ag['cantidad'].sum()) if ag['cantidad'].sum() else 0

				st.write("Cantidad de ventas")
				st.markdown(f"### {formato_miles(total_cant)}")

				st.write("Precio promedio")
				st.markdown(f"### ${precio_promedio_total:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))

				st.write("Costo promedio")
				st.markdown(f"### ${costo_promedio_total:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))

			with col2:
				fig, ax = plt.subplots(figsize=(8, 3))

				# Eje x: meses en orden numérico
				meses_orden = [m for m in sorted(ag.index, key=lambda x: int(x))]
				x = [int(m) for m in meses_orden]

				ax.plot(x, ag.loc[meses_orden, 'precio_prom'], marker='o', color='#1f77b4', label='Precio promedio')
				ax.plot(x, ag.loc[meses_orden, 'costo_prom'], marker='o', color='#d62728', label='Costo promedio')

				ax.set_xlabel('Mes')
				ax.set_ylabel('Monto')
				ax.set_title('Evolución de precio y costo promedio')
				ax.grid(linestyle='--', alpha=0.3)
				ax.legend(loc='best')

				st.pyplot(fig)

			st.markdown('---')


if __name__ == '__main__':
	main()
