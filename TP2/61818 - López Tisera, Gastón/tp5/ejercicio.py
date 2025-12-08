import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

# Configuración de la página
st.set_page_config(page_title="Reporte de productos", layout="wide")

# Barra lateral
with st.sidebar:
    st.title("Configuración")

    # File uploader
    uploaded_file = st.file_uploader("Seleccioná un CSV", type=['csv'])

    # Placeholder para el selectbox de años (se llenará después de cargar datos)
    year_options = []
    selected_year = None

    if uploaded_file is not None:
        # Leer el CSV
        df = pd.read_csv(uploaded_file)

        # Obtener años disponibles ordenados
        year_options = sorted(df['año'].unique())

        # Selectbox para elegir año
        selected_year = st.selectbox("Seleccioná un año", year_options)

# Validaciones
if uploaded_file is None:
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    st.stop()

if selected_year is None:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

# Filtrar datos por año seleccionado
df_year = df[df['año'] == selected_year].copy()

if df_year.empty:
    st.warning("El año seleccionado no tiene datos para mostrar.")
    st.stop()

# Encabezado principal
st.title("Informe de Productos 📈")
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

# Obtener productos únicos ordenados alfabéticamente
productos = sorted(df_year['producto'].unique())

# Para cada producto
for producto in productos:
    # Filtrar datos del producto
    df_producto = df_year[df_year['producto'] == producto].copy()

    # Calcular métricas
    cantidad_total = df_producto['cantidad'].sum()
    precio_promedio = df_producto['ingreso'].sum() / cantidad_total
    costo_promedio = df_producto['costo'].sum() / cantidad_total

    # Crear contenedor con borde
    with st.container(border=True):
        # Título del producto
        st.markdown(f"## :red[{producto}]")

        # Crear columnas
        col1, col2 = st.columns([0.3, 0.7])

        # Columna izquierda: métricas
        with col1:
            st.metric("Cantidad de ventas", f"{cantidad_total:,}")
            st.metric("Precio promedio", ".2f")
            st.metric("Costo promedio", ".2f")

        # Columna derecha: gráfico
        with col2:
            # Agrupar por mes para calcular promedios mensuales
            df_mensual = df_producto.groupby('mes').agg({
                'ingreso': 'sum',
                'costo': 'sum',
                'cantidad': 'sum'
            }).reset_index()

            # Calcular precio y costo promedio por mes
            df_mensual['precio_promedio'] = df_mensual['ingreso'] / df_mensual['cantidad']
            df_mensual['costo_promedio'] = df_mensual['costo'] / df_mensual['cantidad']

            # Ordenar por mes
            df_mensual = df_mensual.sort_values('mes')

            # Crear gráfico
            fig, ax = plt.subplots(figsize=(8, 3))

            # Líneas con colores específicos
            ax.plot(df_mensual['mes'], df_mensual['precio_promedio'],
                   color='#1f77b4', marker='o', label='Precio promedio')
            ax.plot(df_mensual['mes'], df_mensual['costo_promedio'],
                   color='#d62728', marker='o', label='Costo promedio')

            # Configuración del gráfico
            ax.set_xlabel('Mes')
            ax.set_ylabel('Monto')
            ax.set_title('Evolución de precio y costo promedio')
            ax.legend(loc='best')
            ax.grid(True, linestyle='--', alpha=0.3)

            # Mostrar gráfico
            st.pyplot(fig)