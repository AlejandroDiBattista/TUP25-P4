import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")

st.sidebar.title("Configuración")
uploaded_file = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])

if uploaded_file is None:
	st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
	st.stop()

datos = pd.read_csv(uploaded_file)
columnas_requeridas = {"año", "mes", "producto", "cantidad", "ingreso", "costo"}
if not columnas_requeridas.issubset(datos.columns):
	st.error("El CSV no contiene todas las columnas requeridas.")
	st.stop()

MESES_MAP = {
	"1": 1,
	"enero": 1,
	"ene": 1,
	"2": 2,
	"febrero": 2,
	"feb": 2,
	"3": 3,
	"marzo": 3,
	"mar": 3,
	"4": 4,
	"abril": 4,
	"abr": 4,
	"5": 5,
	"mayo": 5,
	"may": 5,
	"6": 6,
	"junio": 6,
	"jun": 6,
	"7": 7,
	"julio": 7,
	"jul": 7,
	"8": 8,
	"agosto": 8,
	"ago": 8,
	"9": 9,
	"septiembre": 9,
	"sep": 9,
	"setiembre": 9,
	"set": 9,
	"10": 10,
	"octubre": 10,
	"oct": 10,
	"11": 11,
	"noviembre": 11,
	"nov": 11,
	"12": 12,
	"diciembre": 12,
	"dic": 12,
}

MESES_LABEL = {
	1: "Ene",
	2: "Feb",
	3: "Mar",
	4: "Abr",
	5: "May",
	6: "Jun",
	7: "Jul",
	8: "Ago",
	9: "Sep",
	10: "Oct",
	11: "Nov",
	12: "Dic",
}


def obtener_mes_numero(valor):
	if pd.isna(valor):
		return pd.NA
	if isinstance(valor, (int, float)) and not pd.isna(valor):
		numero = int(valor)
		if 1 <= numero <= 12:
			return numero
	valor_str = str(valor).strip().lower()
	if valor_str.isdigit():
		numero = int(valor_str)
		if 1 <= numero <= 12:
			return numero
	return MESES_MAP.get(valor_str, pd.NA)


datos = datos.copy()
datos["cantidad"] = pd.to_numeric(datos["cantidad"], errors="coerce")
datos["ingreso"] = pd.to_numeric(datos["ingreso"], errors="coerce")
datos["costo"] = pd.to_numeric(datos["costo"], errors="coerce")
datos["año"] = pd.to_numeric(datos["año"], errors="coerce")
datos["mes_numero"] = datos["mes"].apply(obtener_mes_numero)

anios_disponibles = sorted(datos["año"].dropna().unique())
if not anios_disponibles:
	st.warning("El archivo no contiene años válidos para mostrar.")
	st.stop()

anio_seleccionado = st.sidebar.selectbox("Seleccioná un año", anios_disponibles)

datos_anio = datos[datos["año"] == anio_seleccionado].copy()
if datos_anio.empty:
	st.warning("El año seleccionado no tiene datos para mostrar.")
	st.stop()

datos_anio = datos_anio.dropna(subset=["mes_numero", "cantidad", "ingreso", "costo"])

st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

productos = sorted(datos_anio["producto"].dropna().unique())


def formatear_numero(valor, decimales=0):
	if pd.isna(valor):
		return "-"
	formato = f"{{:,.{decimales}f}}"
	return formato.format(valor)


for producto in productos:
	producto_df = datos_anio[datos_anio["producto"] == producto]
	if producto_df.empty:
		continue

	total_cantidad = producto_df["cantidad"].sum()
	ingreso_total = producto_df["ingreso"].sum()
	costo_total = producto_df["costo"].sum()
	precio_promedio = ingreso_total / total_cantidad if total_cantidad else pd.NA
	costo_promedio = costo_total / total_cantidad if total_cantidad else pd.NA

	with st.container(border=True):
		st.markdown(f"## :red[{producto}]")
		col_metricas, col_grafico = st.columns([0.3, 0.7])

		with col_metricas:
			st.markdown(f"**Cantidad de ventas:** {formatear_numero(total_cantidad, 0)}")
			st.markdown(f"**Precio promedio:** $ {formatear_numero(precio_promedio, 2)}")
			st.markdown(f"**Costo promedio:** $ {formatear_numero(costo_promedio, 2)}")

		with col_grafico:
			resumen_mensual = (
				producto_df
				.groupby("mes_numero", as_index=False)
				.agg({"ingreso": "sum", "costo": "sum", "cantidad": "sum"})
				.sort_values("mes_numero")
			)

			if resumen_mensual.empty:
				st.info("Sin datos mensuales para mostrar.")
				continue

			resumen_mensual["precio_promedio"] = resumen_mensual["ingreso"] / resumen_mensual["cantidad"]
			resumen_mensual["costo_promedio"] = resumen_mensual["costo"] / resumen_mensual["cantidad"]
			resumen_mensual.loc[resumen_mensual["cantidad"] == 0, ["precio_promedio", "costo_promedio"]] = pd.NA
			resumen_mensual["mes_label"] = resumen_mensual["mes_numero"].map(MESES_LABEL)
			resumen_mensual["mes_label"].fillna(resumen_mensual["mes_numero"].astype(str), inplace=True)

			fig, ax = plt.subplots(figsize=(8, 3))
			ax.plot(
				resumen_mensual["mes_label"],
				resumen_mensual["precio_promedio"],
				color="#1f77b4",
				marker="o",
				label="Precio promedio",
			)
			ax.plot(
				resumen_mensual["mes_label"],
				resumen_mensual["costo_promedio"],
				color="#d62728",
				marker="o",
				label="Costo promedio",
			)
			ax.set_xlabel("Mes")
			ax.set_ylabel("Monto")
			ax.set_title("Evolución de precio y costo promedio")
			ax.grid(True, linestyle="--", alpha=0.3)
			ax.legend(loc="best")
			st.pyplot(fig)
			plt.close(fig)
