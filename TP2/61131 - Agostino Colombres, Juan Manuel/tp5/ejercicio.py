import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Reporte de productos", layout="wide")
st.title("Informe de Productos")
st.caption("Metricas resumidas y evolución de precios/costos por año y mes")

#st.write("Escribir aca la solucion del TP5")

st.sidebar.title("Configuración")

archivo = st.sidebar.file_uploader("Subir archivo CSV", type=["csv"])

if not archivo:
    st.info("Por favor, suba un archivo CSV para continuar.")
    st.stop()

try:
    df = pd.read_csv(archivo)
except Exception as e:
    st.error(f"Error al leer el archivo CSV: {e}")
    st.stop()

cols_requeridas = {'año', 'mes', 'producto', 'cantidad', 'ingreso', 'costo'}
faltantes = cols_requeridas - set(df.columns)
if faltantes:
    st.error(f"El archivo CSV debe contener las siguientes columnas: {', '.join(faltantes)}")
    st.stop()

for col_int in ['año', 'mes', 'cantidad']:
    df[col_int] = pd.to_numeric(df[col_int], errors='coerce')

for col_float in ['ingreso', 'costo']:
    df[col_float] = pd.to_numeric(df[col_float], errors='coerce')

df = df.dropna(subset=['año', 'mes', 'producto', 'cantidad', 'ingreso', 'costo'])

anios = sorted(df['año'].unique().tolist())
anio_seleccionado = st.sidebar.selectbox("Seleccionar Año", options=anios)

df_anio = df[df['año'] == anio_seleccionado].copy()
if df_anio.empty:
    st.warning(f"No hay datos disponibles para el año {anio_seleccionado}.")
    st.stop()

df_anio['Precio Promedio'] = df_anio['ingreso'] / df_anio['cantidad'].replace(0, pd.NA)
df_anio['Costo Promedio'] = df_anio['costo'] / df_anio['cantidad'].replace(0, pd.NA)
df_anio = df_anio.dropna(subset=['Precio Promedio', 'Costo Promedio'])

productos = sorted(df_anio['producto'].unique().tolist())

for producto in productos:
    df_p = df_anio[df_anio['producto'] == producto].copy()

    cant_total = df_p['cantidad'].sum()
    precio_promedio_anual = df_p['Precio Promedio'].mean()
    costo_promedio_anual = df_p['Costo Promedio'].mean()

    mensual = (
        df_p.groupby('mes', as_index=False)[["Precio Promedio", "Costo Promedio"]]
        .mean()
        .sort_values('mes')
    )

    # Mostrar resultados y gráfico por producto (dentro del bucle)
    st.markdown(f"## Producto: <span style='color:red'>{producto}</span>", unsafe_allow_html=True)
    col_m, col_g = st.columns([0.3, 0.7], gap="large")

    with col_m:
        st.subheader("Métricas")
        st.write(f"- Cantidad de ventas: **{cant_total:.0f}**")
        st.write(f"- Precio Promedio : **${precio_promedio_anual:.2f}**")
        st.write(f"- Costo Promedio : **${costo_promedio_anual:.2f}**")

    with col_g:
        fig, ax = plt.subplots(figsize=(8, 3))
        ax.plot(
            mensual['mes'],
            mensual['Precio Promedio'],
            marker='o',
            label='Precio Promedio',
            color='blue'
        )
        # usar el nombre de columna correcto (mayúsculas y espacio)
        ax.plot(
            mensual['mes'],
            mensual['Costo Promedio'],
            marker='o',
            label='Costo Promedio',
            color='orange'
        )
        ax.set_title(f"Evolución de Precio y Costo Promedio en {anio_seleccionado}")
        ax.set_xlabel("Mes")
        ax.set_ylabel("Monto")
        ax.grid(True, linestyle='--', alpha=0.3)
        ax.legend()
        st.pyplot(fig)