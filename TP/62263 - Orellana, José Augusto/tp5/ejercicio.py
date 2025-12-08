import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

# 1. Configurar la página
st.set_page_config(page_title="Reporte de productos", layout="wide")

# 2. Barra lateral (sidebar)
st.sidebar.title("Configuración")

# Widget para que el usuario suba un archivo
uploaded_file = st.sidebar.file_uploader("Seleccioná un CSV", type=["csv"])

# 3. Validación inicial
if uploaded_file is None:
    # Mostrar un mensaje en la página principal
    st.info("Subí un archivo CSV desde la barra lateral para comenzar.")
    # Se detiene la ejecución del script
    st.stop()
# 4. Carga y filtrado de datos
df = pd.read_csv(uploaded_file)

# Para crear el selector de año, primero se necesita saber que años hay en el dataset
available_years = sorted(df["año"].unique())

# Se crea un menú desplegable en la barra lateral
selected_year = st.sidebar.selectbox("Seleccioná un año", options=available_years)

# Ahora se filtra la tabla principal
df_filtered = df[df["año"] == selected_year]

# 5. Visualización de datos del año
if df_filtered.empty:
    # Se muestra un mensaje de advertencia de color amarillo
    st.warning("El año seleccionado no tiene datos para mostrar.")
    # se detiene la ejecución
    st.stop()

# 6. Encabezado principal
st.title("Informe de Productos 📈")
# Se crea un texto más pequeño debajo del título
st.caption("Métricas resumidas y evolución de precios/costos por año y mes.")

# 7. Visualización por Producto
products = sorted(df_filtered['producto'].unique())

# Se inicia un bucle para cada producto
for product in products:
    # Se crea un bloque visual con st.container()
    with st.container(border=True):
        # Se filtran los datos para quedar con las filas
        product_df = df_filtered[df_filtered['producto'] == product]

        # Se muestra el título del producto en rojo
        st.markdown(f"## :red[{product}]")

        # Se divide el contenedor en dos columnas
        col1, col2 = st.columns([0.3, 0.7])

        with col1:
            # Métricas
            total_sales = product_df['cantidad'].sum()

            # Se evita dividir por cero
            if total_sales > 0:
                avg_price = product_df['ingreso'].sum() / total_sales
                avg_cost = product_df['costo'].sum() / total_sales
            else:
                avg_price = 0
                avg_cost = 0

            # Se muestran las métricas
            st.metric(label="Cantidad de ventas", value=f"{total_sales:,.0f}")
            st.metric(label="Precio promedio", value=f"${avg_price:,.2f}")
            st.metric(label="Costo promedio", value=f"${avg_cost:,.2f}")
    
        # 8. Gráficos de evolución mensual
        with col2:
            # Preparar los datos para el gráfico
            monthly_data = product_df.groupby('mes').agg({
                'ingreso': 'sum',
                'costo': 'sum',
                'cantidad': 'sum'
            }).reset_index()

            # Se calula las nuevas columnas de promedio para el gráfico
            monthly_data['precio_promedio'] = monthly_data['ingreso'] / monthly_data['cantidad']
            monthly_data['costo_promedio'] = monthly_data['costo'] / monthly_data['cantidad']

            # Crear el gráfico
            fig, ax = plt.subplots(figsize=(8, 3))

            # Se dibuja la primera línea: Precio promedio
            ax.plot(monthly_data['mes'], monthly_data['precio_promedio'], marker='o', color='#1f77b4', label='Precio promedio')
            # Se dibuja la segunda línea: Mes vs Costo promedio
            ax.plot(monthly_data['mes'], monthly_data['costo_promedio'], marker='o', color='#d62728', label='Costo promedio')

            # Se personaliza el gráfico
            ax.set_title("Evolución de precio y costo promedio")
            ax.set_xlabel("Mes")
            ax.set_ylabel("Monto")
            ax.legend(loc='best') # Muestra la leyenda en la mejor posición posible
            ax.grid(True, linestyle='--', alpha=0.3) # Activa la grilla punteada

            # Mostrar el gráfico en Streamlit
            st.pyplot(fig)
