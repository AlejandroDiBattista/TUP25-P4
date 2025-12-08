import io
import base64
import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")


def read_csv_uploaded(uploaded_file):
	# lee el archivo subido por Streamlit (BytesIO o UploadedFile)
	try:
		if hasattr(uploaded_file, "read"):
			return pd.read_csv(uploaded_file)
		else:
			return pd.read_csv(io.StringIO(uploaded_file.decode("utf-8")))
	except Exception as e:
		st.error(f"Error leyendo el CSV: {e}")
		st.stop()


st.sidebar.title("Configuración")
uploaded = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])

if uploaded is None:
	st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
	st.stop()

df = read_csv_uploaded(uploaded)

# Normalizar nombres de columnas (por si vienen con mayúsculas o espacios)
df.columns = [c.strip().lower() for c in df.columns]

required_cols = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
if not required_cols.issubset(set(df.columns)):
	st.error(f"El CSV debe contener las columnas: {', '.join(sorted(required_cols))}")
	st.stop()

# Asegurar tipos
df = df.rename(columns={"año": "año"})
try:
	df["año"] = df["año"].astype(int)
	df["mes"] = df["mes"].astype(int)
	df["cantidad"] = pd.to_numeric(df["cantidad"], errors="coerce").fillna(0)
	df["ingreso"] = pd.to_numeric(df["ingreso"], errors="coerce").fillna(0.0)
	df["costo"] = pd.to_numeric(df["costo"], errors="coerce").fillna(0.0)
except Exception:
	st.error("Error en los tipos de las columnas. Verificá que 'año' y 'mes' sean enteros y los montos numéricos.")
	st.stop()

years = sorted(df["año"].unique().tolist())
selected_year = st.sidebar.selectbox("Seleccioná un año", options=years)

df_year = df[df["año"] == selected_year]
if df_year.empty:
	st.warning("El año seleccionado no tiene datos para mostrar.")
	st.stop()

st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

# Agrupar productos
productos = sorted(df_year["producto"].dropna().unique().tolist())

for producto in productos:
	prod_df = df_year[df_year["producto"] == producto]
	if prod_df.empty:
		continue

	# Cálculos totales por producto
	total_cantidad = prod_df["cantidad"].sum()
	precio_promedio_total = prod_df["ingreso"].sum() / total_cantidad if total_cantidad != 0 else 0.0
	costo_promedio_total = prod_df["costo"].sum() / total_cantidad if total_cantidad != 0 else 0.0

	# Preparar serie mensual
	monthly = (
		prod_df.groupby("mes")[ ["cantidad", "ingreso", "costo"] ]
		.sum()
		.reindex(range(1,13), fill_value=0)
	)
	# evitar división por cero
	precio_mensual = (monthly["ingreso"] / monthly["cantidad"]).replace([pd.NA, pd.NaT, float("inf")], 0).fillna(0)
	costo_mensual = (monthly["costo"] / monthly["cantidad"]).replace([pd.NA, pd.NaT, float("inf")], 0).fillna(0)

	meses = list(monthly.index)

	fig, ax = plt.subplots(figsize=(8, 3))
	# Styling to resemble the reference: thicker lines, larger markers, clearer legend
	ax.plot(
		meses,
		precio_mensual.values,
		marker="o",
		markersize=6,
		markeredgewidth=1,
		markeredgecolor="#1f77b4",
		markerfacecolor="#1f77b4",
		linewidth=2,
		color="#1f77b4",
		label="Precio promedio",
	)
	ax.plot(
		meses,
		costo_mensual.values,
		marker="o",
		markersize=6,
		markeredgewidth=1,
		markeredgecolor="#d62728",
		markerfacecolor="#d62728",
		linewidth=2,
		color="#d62728",
		label="Costo promedio",
	)
	ax.set_xlabel("Mes")
	ax.set_ylabel("Monto")
	ax.set_title("Evolución de precio y costo promedio")
	# Legend with white box and slightly smaller font
	leg = ax.legend(loc="best", frameon=True, fontsize="small")
	leg.get_frame().set_edgecolor("#444")
	leg.get_frame().set_alpha(0.95)
	# Grid style similar to reference
	ax.grid(linestyle="--", alpha=0.3)
	ax.set_xticks(meses)
	# add small padding to y-limits for better visual breathing room
	y_all = pd.concat([precio_mensual.fillna(0), costo_mensual.fillna(0)])
	y_min = float(y_all.min()) if not y_all.empty else 0.0
	y_max = float(y_all.max()) if not y_all.empty else 1.0
	y_pad = max((y_max - y_min) * 0.08, 1.0)
	ax.set_ylim(max(0, y_min - y_pad), y_max + y_pad)

	# Convertir figura a PNG embebible en HTML
	buf = io.BytesIO()
	fig.savefig(buf, format="png", bbox_inches="tight")
	buf.seek(0)
	img_b64 = base64.b64encode(buf.read()).decode("ascii")
	plt.close(fig)

	# Construir tarjeta HTML que contenga métricas y la imagen del gráfico
	html = f"""
	<div style="background:#ffffff;color:#111;border:1px solid #e6e6e6;padding:16px;border-radius:8px;margin-bottom:16px;display:flex;gap:16px;align-items:flex-start;box-shadow:0 6px 18px rgba(0,0,0,0.06)">
	  <div style="flex:0 0 30%;min-width:200px;">
	    <h2 style="color:#c0392b;margin:0 0 8px 0">{producto}</h2>
	    <div style="font-size:0.95rem;color:#333;margin-top:8px">
	      <div style="margin-bottom:12px"><strong>Cantidad de ventas</strong><br><span style="font-size:1.4rem;color:#111">{int(total_cantidad):,}</span></div>
	      <div style="margin-bottom:12px"><strong>Precio promedio</strong><br><span style="font-size:1.2rem;color:#111">${precio_promedio_total:,.2f}</span></div>
	      <div style="margin-bottom:4px"><strong>Costo promedio</strong><br><span style="font-size:1.2rem;color:#111">${costo_promedio_total:,.2f}</span></div>
	    </div>
	  </div>
	  <div style="flex:1;">
	    <img src="data:image/png;base64,{img_b64}" style="width:100%;height:auto;border-radius:6px;"/>
	  </div>
	</div>
	"""

	st.markdown(html, unsafe_allow_html=True)

st.write("---")

st.caption("Fin del informe")