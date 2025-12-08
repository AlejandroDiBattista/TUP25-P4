import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")
def cargar_datos(file) -> pd.DataFrame:
	df = pd.read_csv(file)
	cols = {c.lower(): c for c in df.columns}
	def find(colname):
		for k, v in cols.items():
			if k == colname:
				return v
		return None

	expected = ['año', 'mes', 'producto', 'cantidad', 'ingreso', 'costo']
	mapping = {}
	for e in expected:
		v = find(e)
		if v is None:
			if e == 'año' and 'ano' in cols:
				v = cols['ano']
		if v is None:
			raise ValueError(f"Columna esperada '{e}' no encontrada en el CSV")
		mapping[e] = v

	df = df.rename(columns={v: k for k, v in mapping.items()})



	df['año'] = df['año'].astype(int)
	df['mes'] = df['mes'].astype(str).str.zfill(2).astype(int)
	df['producto'] = df['producto'].astype(str)
	df['cantidad'] = pd.to_numeric(df['cantidad'], errors='coerce').fillna(0).astype(int)
	df['ingreso'] = pd.to_numeric(df['ingreso'], errors='coerce').fillna(0.0)
	df['costo'] = pd.to_numeric(df['costo'], errors='coerce').fillna(0.0)

	return df


def formato_miles(n):
	try:
		return f"{int(round(n)):,}".replace(',', '.')
	except Exception:
		return str(n)


def plot_evolucion(df_prod):
	agg = df_prod.groupby('mes').agg({'cantidad':'sum','ingreso':'sum','costo':'sum'}).reset_index()
	agg = agg.sort_values('mes')

	agg['precio_prom'] = agg.apply(lambda r: r['ingreso']/r['cantidad'] if r['cantidad'] else 0, axis=1)
	agg['costo_prom'] = agg.apply(lambda r: r['costo']/r['cantidad'] if r['cantidad'] else 0, axis=1)

	fig, ax = plt.subplots(figsize=(8, 3))
	ax.plot(agg['mes'], agg['precio_prom'], marker='o', color='#1f77b4', label='Precio promedio')
	ax.plot(agg['mes'], agg['costo_prom'], marker='o', color='#d62728', label='Costo promedio')
	ax.set_xlabel('Mes')
	ax.set_ylabel('Monto')
	ax.set_title('Evolución de precio y costo promedio')
	ax.grid(True, linestyle='--', alpha=0.3)
	ax.legend(loc='best')
	return fig


def main():
	# Sidebar
	st.sidebar.title('Configuración')
	uploaded = st.sidebar.file_uploader('Seleccioná un CSV', type=['csv'])
	año_seleccionado = None
	df = None

	if uploaded is None:
		st.info('Subí un archivo CSV desde la barra lateral para comenzar.')
		return

	try:
		df = cargar_datos(uploaded)
	except Exception as e:
		st.error(f'Error al leer el CSV: {e}')
		return

	años = sorted(df['año'].unique().tolist())
	if not años:
		st.warning('El año seleccionado no tiene datos para mostrar.')
		return

	año_seleccionado = st.sidebar.selectbox('Seleccioná un año', años, format_func=lambda x: str(x))


	df_ano = df[df['año'] == int(año_seleccionado)]
	if df_ano.empty:
		st.warning('El año seleccionado no tiene datos para mostrar.')
		return

	st.title('Informe de Productos 📈')
	st.caption('Métricas resumidas y evolución de precios/costos por año y mes.')


	productos = sorted(df_ano['producto'].unique())
	for prod in productos:
		df_prod = df_ano[df_ano['producto'] == prod]

		total_cantidad = int(df_prod['cantidad'].sum())
		total_ingreso = float(df_prod['ingreso'].sum())
		total_costo = float(df_prod['costo'].sum())
		precio_promedio = total_ingreso / total_cantidad if total_cantidad else 0
		costo_promedio = total_costo / total_cantidad if total_cantidad else 0

		st.markdown('---')
		st.markdown(f"## :red[{prod}]")
		col1, col2 = st.columns([0.3, 0.7])
		with col1:
			st.write('Cantidad de ventas')
			st.markdown(f"### {formato_miles(total_cantidad)}")
			st.write('Precio promedio')
			st.markdown(f"### ${precio_promedio:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
			st.write('Costo promedio')
			st.markdown(f"### ${costo_promedio:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))

		with col2:
			fig = plot_evolucion(df_prod)
			st.pyplot(fig)


if __name__ == '__main__':
	main()
